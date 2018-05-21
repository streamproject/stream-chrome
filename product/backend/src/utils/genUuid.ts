import * as uuid from 'uuid'

function genUuid() {
  return uuid.v4().replace(/-/g, '')
}

export default genUuid
