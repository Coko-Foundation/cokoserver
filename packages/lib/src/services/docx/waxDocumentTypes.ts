// #region marks
export type BaseMarkType =
  | 'strong'
  | 'em'
  | 'code'
  | 'strikethrough'
  | 'superscript'
  | 'subscript'
  | 'smallcaps'
  | 'underline'

export interface BaseMark {
  type: BaseMarkType
}

// Link mark with required href attribute
export interface LinkMark {
  type: 'link'
  attrs: {
    href: string
  }
}

export type Mark = BaseMark | LinkMark
// #endregion marks

export interface ParagraphNode {
  type: 'paragraph'
  content: TextNode[]
}

export interface TextNode {
  type: 'text'
  text: string
  marks?: Mark[]
}

// #region images
export interface ImageNode {
  type: 'image'
  attrs: {
    src?: string
    dataId: string
  }
}

export interface FigureNode {
  type: 'figure'
  content: [ImageNode]
}
// #endregion images

// #region lists
export interface ListItemNode {
  type: 'list_item'
  content: (ParagraphNode | OrderedListNode | BulletListNode)[]
}

export interface OrderedListNode {
  type: 'orderedlist'
  content: ListItemNode[]
}

export interface BulletListNode {
  type: 'bulletlist'
  content: ListItemNode[]
}
// #endregion lists

// #region tables
export interface TableCellNode {
  type: 'table_cell'
  content: ParagraphNode[]
  attrs?: Record<string, any>
}

export interface TableRowNode {
  type: 'table_row'
  content: TableCellNode[]
}

export interface TableNode {
  type: 'table'
  content: TableRowNode[]
}
// #endregion tables

export type TopLevelNode =
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
