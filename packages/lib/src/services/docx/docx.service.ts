import fs from 'fs'
import path from 'path'
import imageSize from 'image-size'
import cloneDeep from 'lodash/cloneDeep'

import {
  AlignmentType,
  Document,
  ExternalHyperlink,
  FileChild,
  ImageRun,
  LevelFormat,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  UnderlineType,
  VerticalAlign,
  WidthType,
  convertMillimetersToTwip,
} from 'docx'

import { WaxDocument, WaxNode } from './waxDocumentTypes'

import {
  ImageData,
  MutableTextRunOptions,
  WaxToDocxConverterOptions,
  TextHandlerOptions,
  ImageType,
  ParagraphHandlerOptions,
  WaxToDocxConverterConfig,
  ContentParserOptions,
  ParagraphOptions,
  TableCellHandlerOptions,
} from './types'

/**
 * TO DO
 *
 * highlight
 * transform case
 * headings
 *
 * lists: every third level, reset style. eg. 1,a,i,1,a,i etc
 *
 */

// You can further simplify the content field for content nodes like this (optional):
// type BlockNode = Exclude<TopLevelNode, TextNode | InlineNode>;
// type ProseMirrorContent = BlockNode | ListItemNode | TableRowNode | TableCellNode | InlineNode;

class WaxToDocxConverter {
  baseFontSize: number
  baseMessage: string = 'WaxToDocxConverter:'
  config: WaxToDocxConverterConfig
  doc: WaxDocument
  fontFamily: string
  imageData: ImageData
  listInstance: number
  listIndentFirstLevelLeft = convertMillimetersToTwip(12.7)
  listIndentFirstLevelHanging = convertMillimetersToTwip(6.3)
  listIndentSecondLevelLeft = convertMillimetersToTwip(25.3)
  listIndentSecondLevelHanging = convertMillimetersToTwip(6.3)
  listIndentThirdLevelLeft = convertMillimetersToTwip(38.1)
  listIndentThirdLevelHanging = convertMillimetersToTwip(3.2)
  listTypes = {
    ORDERED: 'numbered-list',
    BULLET: 'bullet-list',
  }
  paragraphSpacingAfter = 200
  typeToHandlerMap: Record<string, Function>

  constructor(
    doc: WaxDocument,
    imageData,
    options: WaxToDocxConverterOptions = {},
  ) {
    if (!doc) this.error(`No document provided`)
    if (doc.type !== 'doc') this.error(`Document provided is not of type "doc"`)
    if (!doc.content) this.error(`Document provided has no children`)

    if (!Array.isArray(doc.content))
      this.error(`Document content is not an array`)

    this.doc = doc
    this.listInstance = 0

    this.typeToHandlerMap = {
      bulletlist: this.bulletListHandler,
      figure: this.figureHandler, // Paragraph
      figcaption: this.captionHandler,
      hard_break: this.hardBreakHandler, // TextRun
      image: this.imageHandler, // ImageRun
      list_item: this.listItemHandler,
      orderedlist: this.orderedListHandler,
      paragraph: this.paragraphHandler, // Paragraph
      table: this.tableHandler, // Table
      table_cell: this.tableCellHandler, // TableCell
      table_header: this.tableCellHandler, // TableCell
      table_row: this.tableRowHandler, // TableRow
      text: this.textHandler, // TextRun | ExternalHyperlink
    }

    this.imageData = imageData

    this.baseFontSize = options.baseFontSize || 24
    this.fontFamily = options.fontFamily || 'calibri'

    this.config = {
      styles: {
        default: {
          listParagraph: {
            run: {
              font: this.fontFamily,
              size: this.baseFontSize,
            },
          },
        },
        paragraphStyles: [
          {
            id: 'paragraph-styles',
            name: 'Normal',
            run: {
              font: this.fontFamily,
              size: this.baseFontSize,
            },
            paragraph: {
              alignment: AlignmentType.JUSTIFIED,
              spacing: {
                after: this.paragraphSpacingAfter,
              },
            },
          },
        ],
      },
      numbering: {
        config: [
          {
            levels: [
              {
                level: 0,
                format: LevelFormat.DECIMAL,
                text: '%1.',
                alignment: AlignmentType.START,
                style: {
                  paragraph: {
                    contextualSpacing: true,
                    indent: {
                      left: this.listIndentFirstLevelLeft,
                      hanging: this.listIndentFirstLevelHanging,
                    },
                  },
                },
              },
              {
                level: 1,
                format: LevelFormat.LOWER_LETTER,
                text: '%2.',
                alignment: AlignmentType.START,
                style: {
                  paragraph: {
                    contextualSpacing: true,
                    indent: {
                      left: this.listIndentSecondLevelLeft,
                      hanging: this.listIndentSecondLevelHanging,
                    },
                  },
                },
              },
              {
                level: 2,
                format: LevelFormat.LOWER_ROMAN,
                alignment: AlignmentType.END,
                text: '%3.',
                style: {
                  paragraph: {
                    contextualSpacing: true,
                    indent: {
                      left: this.listIndentThirdLevelLeft,
                      hanging: this.listIndentThirdLevelHanging,
                    },
                  },
                },
              },
            ],
            reference: this.listTypes.ORDERED,
          },
          {
            levels: [
              {
                level: 0,
                format: LevelFormat.BULLET,
                text: '\u2022',
                alignment: AlignmentType.START,
                style: {
                  paragraph: {
                    contextualSpacing: true,
                    indent: {
                      left: this.listIndentFirstLevelLeft,
                      hanging: this.listIndentFirstLevelHanging,
                    },
                  },
                },
              },
              {
                level: 1,
                format: LevelFormat.BULLET,
                text: '\u2022',
                alignment: AlignmentType.START,
                style: {
                  paragraph: {
                    contextualSpacing: true,
                    indent: {
                      left: this.listIndentSecondLevelLeft,
                      hanging: this.listIndentSecondLevelHanging,
                    },
                  },
                },
              },
              {
                level: 2,
                format: LevelFormat.BULLET,
                text: '\u2022',
                alignment: AlignmentType.END,
                style: {
                  paragraph: {
                    contextualSpacing: true,
                    indent: {
                      left: this.listIndentThirdLevelLeft,
                      hanging: this.listIndentThirdLevelHanging,
                    },
                  },
                },
              },
            ],
            reference: this.listTypes.BULLET,
          },
        ],
      },
    }
  }

  error = (e: Error | string): void => {
    throw new Error(`${this.baseMessage} ${e}`)
  }

  #findHandler = (type: string): Function => {
    return this.typeToHandlerMap[type]
  }

  /* eslint-disable-next-line class-methods-use-this */
  textHandler = (
    textObject,
    options: TextHandlerOptions = {},
  ): TextRun | ExternalHyperlink => {
    const { text, marks } = textObject
    const objectToPass: MutableTextRunOptions = { text }
    const { isTableHeader } = options

    let isLink = false
    let linkUrl = null

    if (marks) {
      if (!Array.isArray(marks))
        throw new Error(`Text object marks should be an array`)

      marks.forEach(mark => {
        if (mark.type === 'strong' || mark.type === 'bold')
          objectToPass.bold = true

        if (mark.type === 'em' || mark.type === 'i') objectToPass.italics = true

        if (mark.type === 'strikethrough') objectToPass.strike = true
        if (mark.type === 'superscript') objectToPass.superScript = true
        if (mark.type === 'subscript') objectToPass.subScript = true
        if (mark.type === 'smallcaps') objectToPass.smallCaps = true

        if (mark.type === 'underline')
          objectToPass.underline = {
            type: UnderlineType.SINGLE,
          }

        if (mark.type === 'code') {
          objectToPass.font = 'cascadia code'
          objectToPass.shading = {
            type: ShadingType.SOLID,
            color: 'F0F0F0',
          }
        }

        if (mark.type === 'link') {
          objectToPass.style = 'Hyperlink'
          isLink = true
          linkUrl = mark.attrs.href
        }
      })
    }

    if (isLink)
      return new ExternalHyperlink({
        children: [new TextRun(objectToPass)],
        link: linkUrl,
      })

    if (isTableHeader) objectToPass.bold = true

    return new TextRun(objectToPass)
  }

  // #region lists
  listItemHandler = (listItem, options): FileChild[] => {
    return this.contentParser(listItem.content, options)
  }

  listHandler = (list, options): FileChild[] => {
    this.listInstance += 1
    const level = Number.isInteger(options.level) ? options.level + 1 : 0

    const optionsToPass = {
      ...options,
      level,
      instance: this.listInstance,
    }

    return this.contentParser(list.content, optionsToPass)
  }

  orderedListHandler = (list, options): FileChild[] => {
    const optionsToPass = {
      ...options,
      listType: this.listTypes.ORDERED,
    }

    return this.listHandler(list, optionsToPass)
  }

  bulletListHandler = (list, options): FileChild[] => {
    const optionsToPass = {
      ...options,
      listType: this.listTypes.BULLET,
    }

    return this.listHandler(list, optionsToPass)
  }
  // #endregion lists

  // #region tables
  tableHandler = (table): Table => {
    return new Table({
      rows: this.contentParser(table.content) as unknown as TableRow[],
      width: {
        size: 100,
        type: WidthType.PERCENTAGE,
      },
    })
  }

  tableRowHandler = (row): TableRow => {
    const isTableHeader = row.content[0].type === 'table_header'

    return new TableRow({
      children: this.contentParser(row.content, {
        isTableHeader,
      }) as unknown as TableCell[],
      tableHeader: row.content[0].type === 'table_header',
    })
  }

  tableCellHandler = (
    cell,
    options: TableCellHandlerOptions = {},
  ): TableCell => {
    return new TableCell({
      children: this.contentParser(cell.content, {
        isTableCell: true,
        isTableHeader: options.isTableHeader,
      }),
      margins: {
        top: 70,
        bottom: 70,
        left: 100,
      },
      verticalAlign: VerticalAlign.TOP,
    })
  }
  // #endregion tables

  // #region images
  figureHandler = (figure, options): Paragraph => {
    const { listType, level, instance } = options

    const paragraphData: ParagraphOptions = {
      children: this.contentParser(figure.content),
      alignment: AlignmentType.CENTER,
    }

    if (listType && Number.isInteger(level) && instance) {
      paragraphData.numbering = {
        reference: listType,
        level,
        instance,
      }
    }

    return new Paragraph(paragraphData)
  }

  getImageType(filePath: string): ImageType {
    let ext = path.parse(filePath).ext.substring(1).toLowerCase()
    if (ext === 'jpeg') ext = 'jpg'

    if (!['png', 'jpg', 'gif', 'bmp', 'svg'].includes(ext)) {
      throw new Error(
        `${this.baseMessage} Unsupported docx ImageType for extension: ${ext}`,
      )
    }

    return ext as ImageType
  }

  imageHandler = (image): ImageRun => {
    const { dataId, alt } = image.attrs

    if (!dataId || !this.imageData || !this.imageData[dataId]) {
      throw new Error('Missing image data')
    }

    const imagePath = this.imageData[dataId]

    // Scale image to fit page
    // implementation from https://github.com/dolanmiu/docx/issues/232
    // see link for possible change to a not-hardcoded doc width, though current value seems to work fine
    const docWidth = 600
    const dimensions = imageSize(imagePath)
    const { height, width } = dimensions
    const scale = width / docWidth
    const type = this.getImageType(imagePath)

    return new ImageRun({
      type,
      fallback: {
        type: 'png',
        data: fs.readFileSync(imagePath),
      },
      data: fs.readFileSync(imagePath),
      altText: {
        title: alt,
        description: '',
        name: '',
      },
      transformation: {
        width: scale > 1 ? width / scale : width,
        height: scale > 1 ? height / scale : height,
      },
    })
  }

  /* eslint-disable-next-line class-methods-use-this */
  captionHandler = (caption: WaxNode): TextRun => {
    if (!caption || !caption.content || caption.content.length === 0) return
    const textContent = caption.content[0]

    if (textContent.type === 'text') {
      /* eslint-disable-next-line consistent-return */
      return new TextRun({ text: `Caption: ${textContent.text}` })
    }
  }
  // #endregion images

  paragraphHandler = (
    paragraph,
    options: ParagraphHandlerOptions = {},
  ): Paragraph => {
    const p = cloneDeep(paragraph)
    const { listType, level, instance, isTableCell } = options

    const isListItem =
      !!listType && Number.isInteger(level) && Number.isInteger(instance)

    // empty paragraphs do not have a content key at all, so add a ''
    if (!p.content) {
      p.content = [
        {
          type: 'text',
          text: '',
        },
      ]
    }

    const paragraphObject: ParagraphOptions = {
      children: this.contentParser(p.content, options),
    }

    if (isListItem) {
      paragraphObject.numbering = {
        reference: options.listType,
        level: options.level,
        instance: options.instance,
      }
    }

    if (isTableCell) {
      paragraphObject.spacing = {
        before: 0,
        after: 0,
      }
    }

    return new Paragraph(paragraphObject)
  }

  /* eslint-disable-next-line class-methods-use-this */
  hardBreakHandler = (): TextRun => {
    return new TextRun({ text: '' })
  }

  contentParser = (
    content,
    options: ContentParserOptions = {},
  ): FileChild[] => {
    let children = []

    if (content) {
      if (!Array.isArray(content))
        throw new Error('Content needs to be an array')
      else
        content.forEach(item => {
          const { type } = item
          const handler = this.#findHandler(type)

          if (!handler) throw new Error(`Unknown content type "${type}"`)

          const childrenToAdd = handler(item, options)
          // handlers could return a single item or an array of items
          children = children.concat(childrenToAdd)
        })
    } else if (options.renderEmpty) {
      return [this.paragraphHandler({}, options)]
    }

    return children
  }

  buildDocx = (): Document => {
    return new Document({
      ...this.config,
      sections: [
        {
          children: this.contentParser(this.doc.content),
        },
      ],
    })
  }

  async writeToPath(filePath: string): Promise<void> {
    try {
      if (!filePath) throw new Error('No path provided to write method')
      const parsed = this.buildDocx()

      const buffer = await Packer.toBuffer(parsed)
      fs.writeFileSync(filePath, buffer)
    } catch (e) {
      this.error(e)
    }
  }
}

export default WaxToDocxConverter
