import Database from 'better-sqlite3'
import { readFileSync, globSync } from 'node:fs'
import { config } from '../config'
import { DatabaseError } from '../errors/databaseError';

export const db = new Database(config.dbConnectionString)
const puzzleScriptsPaths = globSync('./sql/puzzle/**/*.sql');
const userScriptsPaths = globSync('./sql/user/**/*.sql');
const userPuzzleScriptsPaths = globSync('./sql/user_puzzles/**/*.sql');
const createTablePaths = globSync('./sql/createDb/**/*.sql');

createDb(createTablePaths);

function createDb(tableScripts: string[]) {
  tableScripts.forEach((script) => {
    const content = readFileSync(script, {encoding: 'utf-8'})
    db.exec(content)
  })
}
function loadScripts(paths: string[]) {
  let obj: Record<string,string> = {};
  try {
    paths.forEach((path) => {
      const content = readFileSync(path, { encoding: 'utf-8'});
      const fileName = path.substring(
        path.lastIndexOf('/') + 1,
        path.lastIndexOf('.sql')
      )
      obj[fileName] = content;
    })
    return obj
  } catch (err) {
    throw new DatabaseError(err.message)
  }
}

export const puzzleScripts = loadScripts(puzzleScriptsPaths);
export const userScripts = loadScripts(userScriptsPaths);
export const userPuzzleScripts = loadScripts(userPuzzleScriptsPaths);