// from https://github.com/lethern/Bitburner_git_fetch

// if you want your files to be saved nested in a directory, type it here. Or leave it empty
let prefixDirectory = '';

let configFileName = 'git_config.txt';

export async function main(ns) {
	if (ns.getHostname() !== 'home') {
		throw new Error('Run the script from home');
	}

	if(prefixDirectory){
		if(!prefixDirectory.endsWith('/')) prefixDirectory += '/';
		if(prefixDirectory[0] !== '/') prefixDirectory = '/' + prefixDirectory;
	}

	let config = await readConfig(ns);
	let filesToDownload = config.filesToDownload;
	for (let i in filesToDownload) {
		let filename = filesToDownload[i];
		try {
			var success = await getFileFromGH(ns, config, filename);
			if(success) {
				ns.tprint(`Installed: ${filename} [${Number(i)+1}/${filesToDownload.length}]`);
			} else {
				ns.tprintf("Failed to download %s", filename);
			}
		} catch (e) {
			ns.tprint(`ERROR: tried to download ${filename}: `, e.message);
			throw e;
		}
	}
}

async function readConfig(ns) {
	try {
		let json = ns.read(configFileName);
		return JSON.parse(json);
	}catch(e){
		ns.tprint(`ERROR: Downloading and reading config file failed ${configFileName}`);
		throw e;
	}
}

async function getFileFromGH(ns, config, filename) {
	let filepath = prefixDirectory + filename;

	await ns.scriptKill(filepath, 'home')
	await ns.rm(filepath)
	await ns.sleep(20)
	
	let url = [
		config.baseURL,
		config.owner,
		config.repo,
		config.branch,
		filename
	].join("/");
	ns.print("Request to: "+url);
	return await ns.wget(url, filepath)
}