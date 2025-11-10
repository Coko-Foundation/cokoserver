// #region marks
type BaseMarkType =
  | 'strong'
  | 'em'
  | 'code'
  | 'strikethrough'
  | 'superscript'
  | 'subscript'
  | 'smallcaps'
  | 'underline'

interface BaseMark {
  type: BaseMarkType
}

// Link mark with required href attribute
interface LinkMark {
  type: 'link'
  attrs: {
    href: string
  }
}

type Mark = BaseMark | LinkMark
// #endregion marks

interface ParagraphNode {
  type: 'paragraph'
  content: TextNode[]
}

interface TextNode {
  type: 'text'
  text: string
  marks?: Mark[]
}

// #region images
interface ImageNode {
  type: 'image'
  attrs: {
    src?: string
    dataId: string
  }
}

interface FigureNode {
  type: 'figure'
  content: [ImageNode]
}
// #endregion images

// #region lists
interface ListItemNode {
  type: 'list_item'
  content: (ParagraphNode | OrderedListNode | BulletListNode)[]
}

interface OrderedListNode {
  type: 'orderedlist'
  content: ListItemNode[]
}

interface BulletListNode {
  type: 'bulletlist'
  content: ListItemNode[]
}
// #endregion lists

// #region tables
interface TableCellNode {
  type: 'table_cell'
  content: ParagraphNode[]
  attrs?: Record<string, any>
}

interface TableRowNode {
  type: 'table_row'
  content: TableCellNode[]
}

interface TableNode {
  type: 'table'
  content: TableRowNode[]
}
// #endregion tables

type TopLevelNode =
  | ParagraphNode
  | FigureNode
  | OrderedListNode
  | BulletListNode
  | TableNode

export type WaxNode = TopLevelNode | ListItemNode | TableRowNode | TableCellNode

export type WaxDocument = {
  type: 'doc'
  content: TopLevelNode[]
}
