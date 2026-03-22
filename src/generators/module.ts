import path from 'path';
import { MonorepoConfig, ModuleConfig } from '../utils/types';
import { writeFile, writeJson, toPascalCase } from '../utils/fs';
import { genModuleTsConfig, genViteEnvDts } from './monorepo';
import { genModuleViteConfig } from '../templates/module-vite-config';
import { genModulePackageJson } from '../templates/module-package';
import { genModuleApp } from '../templates/module-app';
import { genModuleIndex } from '../templates/module-index';
import { genModuleMain } from '../templates/module-main';
import { genModuleComponent } from '../templates/module-component';
import { genPostcssConfig, genAppTailwindConfig, genGlobalCss } from '../templates/tailwind-setup';
import { genModuleNetlifyToml } from '../templates/netlify-config';

export async function generateModule(
  moduleDir: string,
  mod: ModuleConfig,
  config: MonorepoConfig,
): Promise<void> {
  const pascalName = toPascalCase(mod.name);

  await writeJson(
    path.join(moduleDir, 'package.json'),
    genModulePackageJson(mod.name, config.name, config.shared)
  );
  await writeFile(path.join(moduleDir, 'vite.config.ts'), genModuleViteConfig(mod, config));
  await writeFile(path.join(moduleDir, 'tsconfig.json'), genModuleTsConfig());
  await writeFile(path.join(moduleDir, 'index.html'), genModuleIndex(mod.name));
  await writeFile(path.join(moduleDir, 'src', 'main.tsx'), genModuleMain(pascalName));
  await writeFile(path.join(moduleDir, 'src', 'App.tsx'), genModuleApp(pascalName, config.shared, config.name, mod.name));
  await writeFile(
    path.join(moduleDir, 'src', 'components', `${pascalName}Feature.tsx`),
    genModuleComponent(pascalName, config.shared)
  );
  await writeFile(path.join(moduleDir, 'src', 'vite-env.d.ts'), genViteEnvDts());

  // Tailwind + CSS
  await writeFile(path.join(moduleDir, 'postcss.config.js'), genPostcssConfig());
  await writeFile(path.join(moduleDir, 'tailwind.config.ts'), genAppTailwindConfig(config.name));
  await writeFile(path.join(moduleDir, 'src', 'index.css'), genGlobalCss());

  // Netlify config for remote module
  await writeFile(path.join(moduleDir, 'netlify.toml'), genModuleNetlifyToml());
}
