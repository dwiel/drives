const getDrive = require('../lib/get-drive.js')
const errorAndExit = require('../lib/exit.js')
const { findCorestore, noticeStorage } = require('../lib/find-corestore.js')

module.exports = async function cmd (src, options) {
  const { version, storage } = options

  if (version === undefined) {
    errorAndExit('--version option is required')
  }

  if (version < 0) {
    errorAndExit('Version number must be non-negative')
  }

  const corestore = await findCorestore(options)
  await noticeStorage(corestore, [src])

  const drive = getDrive(src, corestore)

  try {
    await drive.ready()

    if (version > drive.version) {
      errorAndExit(`Specified version (${version}) is greater than the current drive version (${drive.version})`)
    }

    await drive.truncate(version)
    console.log(`Drive truncated to version ${version}`)
  } catch (error) {
    if (error.code === 'ERR_METHOD_NOT_IMPLEMENTED') {
      errorAndExit('The truncate method may not be implemented in this version of Hyperdrive')
    }
    errorAndExit(`Error truncating drive: ${error.message}`)
  } finally {
    await drive.close()
  }
}