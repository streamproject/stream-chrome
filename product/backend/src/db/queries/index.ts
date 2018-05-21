import * as path from 'path'
import { QueryFile } from 'pg-promise'

const sql = (filename) => {
  return new QueryFile(path.join(__dirname, filename))
}

const queries = {
  addPlatform: sql('addPlatform.sql'),
  addToken: sql('addToken.sql'),
  addUpvote: sql('addUpvote.sql'),
  addUserPromoBlacklist: sql('addUserPromoBlacklist.sql'),
  addView: sql('addView.sql'),

  deletePlatform: sql('deletePlatform.sql'),
  deleteToken: sql('deleteToken.sql'),
  dropAllTables: sql('dropAllTables.sql'),

  findMostRecentUserView: sql('findMostRecentUserView.sql'),
  findPlatform: sql('findPlatform.sql'),
  findPlatformsByUserId: sql('findPlatformsByUserId.sql'),
  findToken: sql('findToken.sql'),
  findUser: sql('findUser.sql'),
  findUserByPlatform: sql('findUserByPlatform.sql'),
  findUserPromo: sql('findUserPromo.sql'),

  updateUser: sql('updateUser.sql'),
}

export default queries
