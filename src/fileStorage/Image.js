const path = require('path')
const { exec } = require('child_process')
const { buffer } = require('stream/consumers')

const mime = require('mime-types')
const sharp = require('sharp')
const commandExists = require('command-exists').sync
const fs = require('fs-extra')
const config = require('config')
const exifr = require('exifr')

const logger = require('../logger')

// #region helpers
const getMetadata = async fileBuffer => {
  return sharp(fileBuffer, { limitInputPixels: false }).metadata()
}

const imageSizeConversionMapper = {
  tiff: {
    small: 'png',
    medium: 'png',
    full: 'png',
  },
  tif: {
    small: 'png',
    medium: 'png',
    full: 'png',
  },
  svg: {
    small: 'svg',
    medium: 'svg',
    full: 'png',
  },
  png: {
    small: 'png',
    medium: 'png',
    full: 'png',
  },
  default: {
    small: 'jpeg',
    medium: 'jpeg',
    full: 'png',
  },
}

const orientationMap = {
  'Horizontal (normal)': 1,
  'Mirror horizontal': 2,
  'Rotate 180': 3,
  'Mirror vertical': 4,
  'Mirror horizontal and rotate 270 CW': 5,
  'Rotate 90 CW': 6,
  'Mirror horizontal and rotate 90 CW': 7,
  'Rotate 270 CW': 8,
}
// #endregion helpers

class Image {
  // properties: filename, dir
  constructor(properties) {
    this.name = path.parse(properties.filename).name
    this.extension = path.extname(properties.filename).slice(1)
    this.path = path.join(properties.dir, properties.filename)
    this.filename = properties.filename
    this.dir = properties.dir

    this.conversionMapper = {
      eps: 'svg',
    }

    const convertTo = this.conversionMapper[this.extension]
    this.shouldConvert = !!convertTo
    this.outputExtension = this.shouldConvert ? convertTo : this.extension

    const { maximumWidthForSmallImages, maximumWidthForMediumImages } =
      config.get('fileStorage')

    this.maxWidth = {
      small: parseInt(maximumWidthForSmallImages, 10) || 180,
      medium: parseInt(maximumWidthForMediumImages, 10) || 640,
    }

    this.mimetype = mime.lookup(this.extension)
  }

  /**
   * Takes the image file and writes a converted image in the directory.
   * eg. dir/file.eps will generate dir/file.svg
   */
  async #createConvertedFile() {
    if (!commandExists('magick') && !commandExists('convert')) {
      throw new Error(
        'ImageMagick needs to be installed on your OS or container',
      )
    }

    const targetExtension = this.conversionMapper[this.extension]
    const targetPath = `${path.join(this.dir, this.name)}.${targetExtension}`

    return new Promise((resolve, reject) => {
      exec(`convert ${this.path} ${targetPath}`, (error, stdout, stderr) => {
        if (error) return reject(error)
        logger.info(stdout || stderr)
        return resolve(targetPath)
      })
    })
  }

  /* eslint-disable class-methods-use-this */
  async #rotate(fileBuffer, filePath, metadata) {
    if (!metadata.exif) return

    let exifMetadata

    try {
      // more reliable to use fileBuffer, but we still want to see if metadata.exif exists or not
      exifMetadata = await exifr.parse(fileBuffer)
    } catch (e) {
      logger.error(
        `FILE_STORAGE: generateVersions: failed to get exif metadata`,
        e.message,
      )
    }

    if (!exifMetadata) return

    const orientationString = exifMetadata?.Orientation
    const orientation = orientationMap[orientationString] ?? 1

    if ([3, 6, 8].includes(orientation)) {
      const image = sharp(fileBuffer)

      switch (orientation) {
        case 3:
          image.rotate(180)
          break
        case 6:
          image.rotate(90)
          break
        case 8:
          image.rotate(270)
          break
        default:
      }

      // replace original file with rotated original
      const updatedFileBuffer = await image.toBuffer()
      await sharp(updatedFileBuffer).toFile(filePath)
    }
  }

  async generateVersions() {
    let filePath = this.path
    if (this.shouldConvert) filePath = await this.#createConvertedFile()

    const fileReadStream = fs.createReadStream(filePath)
    const fileBuffer = await buffer(fileReadStream)

    const metadata = await getMetadata(fileBuffer)
    const originalImageWidth = metadata.width

    await this.#rotate(fileBuffer, filePath, metadata)

    const sizes = ['small', 'medium', 'full']

    const [smallPath, mediumPath, fullPath] = sizes.map(size => {
      return path.join(
        this.dir,
        `${this.name}_${size}.${
          imageSizeConversionMapper[this.outputExtension]
            ? imageSizeConversionMapper[this.outputExtension].small
            : imageSizeConversionMapper.default.small
        }`,
      )
    })

    if (this.outputExtension === 'svg') {
      await sharp(fileBuffer).toFile(smallPath)
      await sharp(fileBuffer).toFile(mediumPath)
      await sharp(fileBuffer).toFile(fullPath)
    } else {
      await sharp(fileBuffer)
        .resize({ width: this.maxWidth.small })
        .toFile(smallPath)

      if (originalImageWidth < this.maxWidth.medium) {
        await sharp(fileBuffer).toFile(mediumPath)
      } else {
        await sharp(fileBuffer)
          .resize({ width: this.maxWidth.medium })
          .toFile(mediumPath)
      }

      await sharp(fileBuffer).toFile(fullPath)
    }

    const { width, height, space, density, size } = metadata

    const originalData = {
      type: 'original',
      path: filePath,
      filename: this.filename,
      extension: this.extension,
      mimetype: this.mimetype,
      size,
      imageMetadata: {
        density,
        height,
        space,
        width,
      },
    }

    const sizesData = await Promise.all(
      [smallPath, mediumPath, fullPath].map(async (p, i) => {
        const pReadStream = fs.createReadStream(p)
        const pBuffer = await buffer(pReadStream)

        const {
          width: pWidth,
          height: pHeight,
          space: pSpace,
          density: pDensity,
          size: pSize,
        } = await getMetadata(pBuffer)

        let type

        switch (i) {
          case 0:
            type = 'small'
            break
          case 1:
            type = 'medium'
            break
          default:
            type = 'full'
            break
        }

        return {
          type,
          path: p,
          filename: path.basename(p),
          extension: path.extname(p).slice(1),
          mimetype: mime.lookup(p),
          size: pSize,
          imageMetadata: {
            density: pDensity,
            height: pHeight,
            space: pSpace,
            width: pWidth,
          },
        }
      }),
    )

    return [originalData, ...sizesData]
  }
}

module.exports = Image
