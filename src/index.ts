import { readdirSync, statSync } from 'fs';
import { isAbsolute, join, normalize } from 'path';

interface Options {
	path: string;
	__dirname?: string;
	tree?: boolean;
	recursive?: boolean;
	maxDepth?: number;
	ignoreEmptyFiles?: boolean;
	ignoreEmptyDirs?: boolean;
	unique?: boolean;
	resolve?: (module: object) => void;
	each?: ({ filename, module }: { filename: string; module: object }) => void;
}

const defaultOptions = {
	path: '',
	ignoreEmptyDirs: true,
	ignoreEmptyFiles: true,
	unique: false,
	tree: true,
	recursive: true,
};

function absolute(path: string) {
	return !Boolean(path.match(/^[\\/]/)) && isAbsolute(path);
}

export default async function importAll({
	path: pathToDir,
	__dirname: dirPath,
	resolve,
	each,
	ignoreEmptyDirs,
	ignoreEmptyFiles,
	unique,
	tree,
	recursive,
}: Options = defaultOptions): Promise<{ [key: string]: object }> {
	if (!absolute(pathToDir) && !dirPath)
		throw new Error(
			'If "path" parameter isn\'t absolute path, you shoud pass "__dirname" constant into options. About __dirname: https://nodejs.org/docs/latest/api/modules.html#modules_dirname'
		);

	const fullDirPath = absolute(pathToDir) ? normalize(pathToDir) : join(dirPath!, pathToDir);

	if (!statSync(fullDirPath).isDirectory()) throw new Error('"path" isn\'t path to dir');

	const alreadyLoaded: Map<string, string> = new Map();

	return await load(fullDirPath);

	async function load(path: string): Promise<{ [key: string]: object }> {
		const modules: { [key: string]: object } = {};
		for (const fullName of readdirSync(path)) {
			const filePath = join(path, fullName);

			if (statSync(filePath).isDirectory()) {
				if (!recursive) continue;
				const subModules = await load(filePath);

				if (ignoreEmptyDirs && Object.keys(subModules).length == 0) continue;
				if (tree) modules[fullName] = subModules;
				else for (const [name, module] of Object.entries(subModules)) modules[name] = module;
			} else {
				const module = await import(filePath).catch(console.error);
				const length = Object.keys(module).length;
				const empty = length == 0 || (length == 1 && JSON.stringify(module) == '{"default":{}}');
				const filename = fullName.replace(/\.\w+$/, '');

				if (ignoreEmptyFiles && empty) continue;
				if (!tree || unique) {
					if (alreadyLoaded.has(fullName))
						throw new Error(
							`${
								unique
									? 'Option unique is active'
									: 'Objects cannot contain two properties with the same key'
							}\n"${fullName}" already exists in other directory\n\n${filePath}\n${alreadyLoaded.get(
								fullName
							)}\n`
						);
					alreadyLoaded.set(fullName, filePath);
				}

				let moduleResolved = module.default ? module.default : module;

				if (resolve) moduleResolved = resolve(moduleResolved);
				if (each) each({ filename, module: moduleResolved });
				modules[filename] = moduleResolved;
			}
		}
		return modules;
	}
}
