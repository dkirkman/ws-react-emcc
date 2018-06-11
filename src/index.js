import libTest_wasm from './libTest.wasm';

// Same set of tests emscripten uses to work out where it is
const ENVIRONMENT_IS_WEB = typeof window === 'object';
const ENVIRONMENT_IS_WORKER = typeof importScripts === 'function';
const ENVIRONMENT_IS_NODE = typeof process === 'object' && typeof require === 'function' && !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_WORKER;

console.log('Here I am, your awesome module');
export default function(options, cb) {
  let url_prefix = '';
  if (typeof options === 'object' && options.url_prefix)
    url_prefix = options.url_prefix;
  if (url_prefix.slice(-1) !== '/')
    url_prefix += '/';
  
  let module_options = {
    locateFile: function (path) {
      if(path.endsWith('.wasm')) {
        if (ENVIRONMENT_IS_NODE) {
          return (__dirname + '/' + libTest_wasm);
        } else {
          return (url_prefix + libTest_wasm);
        }
      }
      return path;
    }
  };

  if (typeof options === 'object'
      && options['asm.js'] === true) {
    console.log('loading asm.js version of libTest');

    import(/* webpackChunkName: "libTestAsm" */ 
      './libTestAsm.js').then(module => {
        module.default(module_options).then(cspace => cb(cspace));
      });

  } else {
    // loading webpack
    console.log('loading webpack version of libTest boot boot toot');

    import(/* webpackChunkName: "libTest" */ 
      './libTest.js').then(module => {
        import("./libTest.wasm").then(wasm => {
          console.log('WASM WASM WASM');
          console.log('it is ' + wasm.default);
          for (var key in wasm) {
            console.log('key ' + key + ' ' + wasm[key]);
          }
        });
        module.default(module_options).then(cspace => cb(cspace));
      });
  }
};


