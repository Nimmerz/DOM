const fs = require('fs');
const path = require('path');

const nodeParams = process.argv.slice(2);

const customParams = nodeParams.reduce((accParams, currentParams) => {
    const [type, value] = currentParams.split('=')
    return {
        ...accParams,
        [type]: value
    }
}, {});


crawler(customParams['--DIR']);

function readAllFiles(dir) {
    let files = fs.readdirSync(dir);
    const allFilesName = [];
    for (let x in files) {
        let next = path.join(dir, files[x]);
        if (fs.lstatSync(next).isDirectory()) {
            allFilesName.push(files[x])
            readAllFiles(next);
        }
        else {
            allFilesName.push(files[x]);
        }
    }
    return allFilesName
}

// function crawl(dir) {
//     console.log('[+]', dir);
//     let files = fs.readdirSync(dir);
//     for(let x in files) {
//         let next = path.join(dir, files[x])
//         if (fs.lstatSync(next).isDirectory()==true) {
//             crawl(next);
//         }
//         else {
//             console.log('\t', next)
//         }
//     }
//
// }
//
// crawl(__dirname);



function filterByExtension(item, dir) {
    const extensionParam = customParams['--PATTERN'];
    if (!extensionParam) {
        return true

    }
    let itemPath = path.join(dir, item);
    return itemPath.includes(extensionParam)
}


function filterByType(item) {
    const typeParams = customParams['--TYPE'];

    if (!typeParams) {
        return true
    }

    const stats = fs.statSync(item);

    if (typeParams === 'D') {
        return stats.isDirectory()
    }
    return stats.isFile()
}


function isSizes(size, fileSizeInBytes, typeBytes) {

    const fileSizeInKylobytes = fileSizeInBytes / 1000;
    const fileSizeInMegabytes = fileSizeInBytes / 1000000;
    const fileSizeInGigabytes = fileSizeInBytes / 1000000000;

    if (size === fileSizeInBytes + "B"
        || size === fileSizeInKylobytes + "K"
        || size === fileSizeInMegabytes + "M"
        || size === fileSizeInGigabytes + "G") {
        console.log(typeBytes);
    }

}


function filterBytes(item, dir) {

    const typeBytesMin = customParams['--MIN-SIZE'];
    const typeBytesMax = customParams['--MAX-SIZE'];

    const stats = fs.statSync(item);

    const fileSizeInBytes = stats["size"];

    let minSize = typeBytesMin;
    let minLength = typeBytesMin;

    if (!typeBytesMin && !typeBytesMax) {
        return true
    }

    isSizes(minSize, fileSizeInBytes, typeBytesMin);

    if (minLength > stats.size / 1 || minLength > stats.size / 1000
        || minLength > stats.size / 1000000 || minLength > stats.size / 1000000000) {
        return false;
    }

    let maxSize = typeBytesMax;
    let maxLength = typeBytesMax;

    isSizes(maxSize, fileSizeInBytes, typeBytesMax);

    if (maxLength > stats.size / 1 || maxLength > stats.size / 1000
        || maxLength > stats.size / 1000000 || maxLength > stats.size / 1000000000) {
        return false;
    }

};


function crawler(dir) {
    const allFilesName = readAllFiles(dir);

    const filtered = allFilesName
        .filter((item) => {
            const pathItem = path.join(dir, item);
            return filterByExtension(item, dir) && filterByType(pathItem, path) && filterBytes(item, dir)
        });

    filtered.forEach((item) => {
        console.log(path.join(dir, item));
    })
};








