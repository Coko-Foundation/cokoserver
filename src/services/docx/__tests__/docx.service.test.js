const fs = require('fs')
const path = require('path')
const axios = require('axios')
const { faker } = require('@faker-js/faker')

const { v4: uuid } = require('uuid')

const WaxToDocxConverter = require('../docx.service')
const { getTestFilePath } = require('./_helpers')

const imageId = uuid()

const imageUrl =
  'https://i.picsum.photos/id/100/700/400.jpg?hmac=HNlX5PySEOvbt1FPUSu-t3jeUbXs1k1q04XSk7f5yLY' // scale down
// 'https://i.picsum.photos/id/774/200/300.jpg?hmac=HLVTa6awH1Il_dvZGTiqNsqGiyR5RgPXTkD_pBW9L48' // center

const saveImage = async url => {
  return new Promise((resolve, reject) => {
    const p = path.join(__dirname, '..', '..', '..', 'tmp', 'test')

    axios({
      method: 'GET',
      url,
      responseType: 'stream',
    }).then(response => {
      const writeStream = fs.createWriteStream(p)
      response.data.pipe(writeStream)

      writeStream.on('finish', () => {
        resolve(p)
      })

      writeStream.on('error', e => {
        console.error(e)
        reject(p)
      })
    })
  })
}

const document = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'This is normal text. ',
        },
        {
          type: 'text',
          text: 'This is bold text. ',
          marks: [{ type: 'strong' }],
        },
        {
          type: 'text',
          text: 'This is italic text. ',
          marks: [{ type: 'em' }],
        },
        {
          type: 'text',
          text: 'This one is bold AND italic. ',
          marks: [{ type: 'em' }, { type: 'strong' }],
        },
        {
          type: 'text',
          text: 'This is some code',
          marks: [{ type: 'code' }],
        },
        {
          type: 'text',
          text: '. ',
        },
        {
          type: 'text',
          text: "Here's some strikethrough text",
          marks: [{ type: 'strikethrough' }],
        },
        {
          type: 'text',
          text: '. ',
        },
        {
          type: 'text',
          text: 'And here is some ',
        },
        {
          type: 'text',
          text: 'superscript',
          marks: [{ type: 'superscript' }],
        },
        {
          type: 'text',
          text: ' and some ',
        },
        {
          type: 'text',
          text: 'subscript',
          marks: [{ type: 'subscript' }],
        },
        {
          type: 'text',
          text: '. ',
        },
        {
          type: 'text',
          text: 'This is small caps. ',
          marks: [{ type: 'smallcaps' }],
        },
        {
          type: 'text',
          text: 'This is some underlined text',
          marks: [{ type: 'underline' }],
        },
        {
          type: 'text',
          text: '. ',
        },
        {
          type: 'text',
          text: 'This is a link.',
          marks: [{ type: 'link', attrs: { href: 'http://www.example.com' } }],
        },
        {
          type: 'text',
          text: ' ',
        },
        {
          type: 'text',
          text: 'And this is a bold link.',
          marks: [
            { type: 'link', attrs: { href: 'http://www.example.com' } },
            { type: 'strong' },
          ],
        },
        {
          type: 'text',
          text: ' ',
        },
      ],
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: `${faker.lorem.sentences(20)} `,
        },
      ],
    },
    {
      type: 'figure',
      content: [
        {
          type: 'image',
          attrs: {
            // src: '',
            dataId: imageId,
          },
        },
      ],
    },
    {
      type: 'orderedlist',
      content: [
        {
          type: 'list_item',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: faker.lorem.sentences(5),
                },
              ],
            },
          ],
        },
        {
          type: 'list_item',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'Second item',
                },
              ],
            },
          ],
        },
        {
          type: 'list_item',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'Third item',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: ``,
        },
      ],
    },
    {
      type: 'orderedlist',
      content: [
        {
          type: 'list_item',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'Restart numbering',
                },
              ],
            },
          ],
        },
        {
          type: 'list_item',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'And ',
                },
                {
                  type: 'text',
                  text: 'add ',
                  marks: [{ type: 'strong' }],
                },
                {
                  type: 'text',
                  text: 'some ',
                  marks: [{ type: 'em' }],
                },
                {
                  type: 'text',
                  text: 'formatting',
                  marks: [{ type: 'superscript' }],
                },
              ],
            },
          ],
        },
        {
          type: 'list_item',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'Some nested list items below',
                },
              ],
            },
            {
              type: 'orderedlist',
              content: [
                {
                  type: 'list_item',
                  content: [
                    {
                      type: 'paragraph',
                      content: [
                        {
                          type: 'text',
                          text: `First nested item. ${faker.lorem.sentences(
                            5,
                          )}`,
                        },
                      ],
                    },
                  ],
                },
                {
                  type: 'list_item',
                  content: [
                    {
                      type: 'paragraph',
                      content: [
                        {
                          type: 'text',
                          text: 'Second nested item',
                        },
                      ],
                    },
                    {
                      type: 'orderedlist',
                      content: [
                        {
                          type: 'list_item',
                          content: [
                            {
                              type: 'paragraph',
                              content: [
                                {
                                  type: 'text',
                                  text: `Another level. ${faker.lorem.sentences(
                                    5,
                                  )}`,
                                },
                              ],
                            },
                          ],
                        },
                        {
                          type: 'list_item',
                          content: [
                            {
                              type: 'paragraph',
                              content: [
                                {
                                  type: 'text',
                                  text: 'Second item at third level',
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: 'list_item',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'Go back to previous level',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: ``,
        },
      ],
    },
    {
      type: 'bulletlist',
      content: [
        {
          // id: 'b1',
          type: 'list_item',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'Bullet list item',
                },
              ],
            },
          ],
        },
        {
          // id: 'b2',
          type: 'list_item',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'Another bullet list item',
                },
              ],
            },
            {
              type: 'bulletlist',
              content: [
                {
                  // id: 'b11',
                  type: 'list_item',
                  content: [
                    {
                      type: 'paragraph',
                      content: [
                        {
                          type: 'text',
                          text: 'And nested',
                        },
                      ],
                    },
                    {
                      // id: 'b111',
                      type: 'bulletlist',
                      content: [
                        {
                          type: 'list_item',
                          content: [
                            {
                              type: 'paragraph',
                              content: [
                                {
                                  type: 'text',
                                  text: 'And nested again',
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          // id: 'b3',
          type: 'list_item',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'Final bullet list item',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      type: 'table',
      content: [
        {
          type: 'table_row',
          content: [
            {
              type: 'table_cell',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'first cell',
                    },
                  ],
                },
              ],
            },
            {
              type: 'table_cell',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'second cell',
                    },
                  ],
                },
              ],
            },
            {
              type: 'table_cell',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'third cell',
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: 'table_row',
          content: [
            {
              type: 'table_cell',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'row 2, first cell',
                    },
                  ],
                },
              ],
            },
            {
              type: 'table_cell',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'row 2, second cell',
                    },
                  ],
                },
              ],
            },
            {
              type: 'table_cell',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'row 2, third cell',
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: 'table_row',
          content: [
            {
              type: 'table_cell',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'row 3, first cell',
                    },
                  ],
                },
              ],
            },
            {
              type: 'table_cell',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'row 3, second cell',
                    },
                  ],
                },
              ],
            },
            {
              type: 'table_cell',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'row 3, third cell',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}

/* eslint-disable-next-line jest/no-disabled-tests */
describe.skip('Docx service', () => {
  test('Generic document', async () => {
    const imageData = {}
    const filepath = getTestFilePath('base.docx')
    const imagePath = await saveImage(imageUrl)

    imageData[imageId] = imagePath

    const converter = new WaxToDocxConverter(document, imageData)
    converter.writeToPath(filepath)

    fs.unlink(imagePath, e => {
      if (e) throw new Error(e)
    })

    expect(true).toBe(true)
  })
})
