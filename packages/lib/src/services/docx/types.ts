import { IPropertiesOptions, ParagraphChild, AlignmentType } from 'docx'

export type ImageData = Record<string, string>

// IRunOptions from docs is readonly and I need to build the object before passing it to TextRun
export type MutableTextRunOptions = {
  text: string
  bold?: boolean
  italics?: boolean
  strike?: boolean
  superScript?: boolean
  subScript?: boolean
  smallCaps?: boolean
  font?: string
  style?: string
  underline?: {
    type: 'single'
  }
  shading?: {
    type: 'solid'
    color: string
  }
}

export type WaxToDocxConverterOptions = {
  baseFontSize?: number
  fontFamily?: string
}

export type TextHandlerOptions = {
  isTableHeader?: boolean
}

export type ImageType = 'png' | 'jpg' | 'gif' | 'bmp' | 'svg'

export type ParagraphHandlerOptions = {
  instance?: number
  isTableCell?: boolean
  level?: number
  listType?: string
}

export type ParagraphOptions = {
  children: ParagraphChild[]
  alignment?: (typeof AlignmentType)[keyof typeof AlignmentType]
  numbering?: {
    reference: string
    level: number
    instance: number
  }
  spacing?: {
    before: number
    after: number
  }
}

export type TableCellHandlerOptions = {
  isTableHeader?: boolean
}

export type WaxToDocxConverterConfig = Omit<IPropertiesOptions, 'sections'>

export type ContentParserOptions = {
  isTableHeader?: boolean
  renderEmpty?: boolean
} & ParagraphHandlerOptions
