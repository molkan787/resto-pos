For developement run `node serve.js` in the root directory

To build production version run `node build.js` in the root directory

### Engines
- Node: 12.4.0
- Electron: 6.0.11


#### Important
To properly install and build `printer` package you need to install "Visual Studio Build Tools 2017" and Python 3.10, thus exact versions must be installed, If you have multiple versions of python installed make sure to set path to version 3.10 to "npm_config_python" env variable.
In case of any other issues/errors check out node-gyp guide at https://www.npmjs.com/package/node-gyp/v/6.1.0


### Build Instruction

#### Resources Preparation
- Download MySQL Server community edition in "zip" format, name it "mysql-server.zip" and place it in "electron/files", mysql will be auto extracted and installed when performing initial setup of the pos after the instalation

#### Projects Preparation

##### apos_v (main app written in vue & typescript)
cd into "apos_v" directory and run the following:
- `yarn`
- `yarn add "../resto-common"`
- `yarn add "<path-to-murew-core-project>"` "murew-core" is a shared library (available in "resto-e-commerce" repository)

##### electron (runtime app)
cd into "electron" directory and run the following:
- `yarn`
- `yarn add "../resto-common"`

#### Build
Finally to build (package) the app, cd back to main directory of the repository and run `yarn build`,
Once build is completed the output installer will be located in "electron/dist"