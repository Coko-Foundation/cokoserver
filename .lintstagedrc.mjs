import without from 'lodash/without'

import lintstaged from '@coko/lint/src/lintstaged'

lintstaged['*.js'] = without(lintstaged['*.js'], 'stylelint')

export default lintstaged
