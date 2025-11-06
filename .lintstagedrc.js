import without from 'lodash/without'

import { lintstaged } from '@coko/lint'

lintstaged['*.js'] = without(lintstaged['*.js'], 'stylelint')

export default lintstaged
