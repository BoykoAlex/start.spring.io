import execa from 'execa';
import path from 'path';
import {cleanDir, createDir, move, execaOptions, info, log, main} from './utils';

const DATA_DIR = path.join(__dirname, '../@oss');

const REPO = process.env.OSS_ORG || 'spring-io';
const ANAME = process.env.OSS_NAME = 'start.spring.io';
const versionId = process.env.OSS_BRANCH || 'master';

const AEXT = '.tar.gz';
const url = version => `https://github.com/${REPO}/${ANAME}/archive/${version}${AEXT}`;
const loadRepo = async () => {
    info('Loading');
    cleanDir(DATA_DIR);
    createDir(DATA_DIR);
    const archive = path.join(DATA_DIR, `${versionId}${AEXT}`)
    downloadRepo(url(versionId), archive);
    extractRepo(archive, versionId);
    Object.keys(move).forEach(p => console.log(p));

    move(`${DATA_DIR}/start-client/src/components`, DATA_DIR);
    move(`${DATA_DIR}/start-client/src/fonts`, DATA_DIR);
    move(`${DATA_DIR}/start-client/src/images`, DATA_DIR);
    move(`${DATA_DIR}/start-client/src/styles`, DATA_DIR);
    move(`${DATA_DIR}/start-client/src/App.js`, DATA_DIR);
    move(`${DATA_DIR}/start-client/src/Extend.json`, DATA_DIR);

    cleanDir(`${DATA_DIR}/start-client`);
    cleanDir(archive);
};

const downloadRepo = (url, dest) => {
    log('Downloading', url, 'to', dest);
    const {failed} = execa.sync('curl', ['-fLs', url, '-o', dest], execaOptions);
    if (failed) throw new Error(`Couldn't download ${url} to ${dest}`);
};

const extractRepo = (file, version) => {
    log('Extracting', file);
    const dest = `${DATA_DIR}`;
    createDir(dest);
    const {failed} = execa.sync(
        'tar',
        [
            '-C',
            dest,
            '--strip-components=1',
            '-xvzf',
            file,
            `${ANAME}-${version}/start-client/src`,
        ],
        execaOptions
    );
    if (failed) throw new Error(`Couldn't extract ${file}`);
};

main('load-repos', loadRepo)
