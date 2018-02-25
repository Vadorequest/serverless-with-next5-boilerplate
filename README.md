Serverless with Next
===================

This is a tutorial to make Serverless (https://serverless.com) work with Next.js (https://github.com/zeit/next.js/).

# WHY?

Because Next.js helps building SSR react applications and serverless helps to deploy them on any cloud provider. (AWS, Google Cloud, etc.)

In my case, I need to render my homepage based on settings I must fetch from a DB. Hence the fact I need a server-side application if I want to have a good SEO.

We could use `create-react-app` and just deploy the bundled version, but SEO wouldn't be great.

# HOW?

We are going to start from the most simple template (`hello-world`) and add what's necessary.

# Features

- es6 (with source map support)
- development ease (using [serverless-offline](https://github.com/dherault/serverless-offline))
- stages (production, staging, development)

# Requirements

This tutorial assume:

- a basic knowledge of Serverless, with the `serverless` cli installed. (see https://serverless.com/learn/quick-start/)
- a basic knowledge of Next.js. (see https://learnnextjs.com)
- an AWS account, `sls deploy` commands will deploy on AWS (another provider is possible, but the `serverless.yml` will need to be modified)
- node < `6.9.3` installed, I personally used `8.9.4`, doesn't matter so much because we use webpack. (See [supported-languages](https://serverless.com/framework/docs/platform/commands/run#supported-languages))

# Steps (tutorial, from scratch)

1. Run `sls create --template hello-world --path serverless-with-next` (optionally ignore `.idea` folder)
1. Test using `sls deploy` should print something like this:

    ![](./ss/2018-02-25%2013.33.19%20-%20initial%20sls%20deploy.png)

1. Let's add ES6 using webpack and serverless-webpack

    1. Run `npm init -y`
    1. Ignore `.webpack` folder
    1. Update `serverless.yml`
        ```
        plugins:
          - serverless-webpack
        ```
        We use the `serverless-webpack` plugin to build our serverless app.
        The build is then uploaded to aws
        
    1. Add `.babelrc` config
        ```
        {
          "plugins": ["source-map-support", "transform-runtime"],
          "presets": ["env", "stage-3"]
        }
        ```
   
    1. Add the following npm dependencies:
        ```json
        "devDependencies": {
            "babel-core": "6.26.0",
            "babel-loader": "7.1.2",
            "babel-plugin-source-map-support": "2.0.0",
            "babel-plugin-transform-runtime": "6.23.0",
            "babel-preset-env": "1.6.1",
            "babel-preset-stage-3": "6.24.1",
            "serverless-webpack": "4.3.0",
            "webpack": "3.11.0",
            "webpack-node-externals": "1.6.0"
        },
        "dependencies": {
            "aws-sdk": "2.194.0",
            "babel-runtime": "6.26.0",
            "source-map-support": "0.5.3"
        }
        ```
        `aws-sdk` isn't needed for this tutorial, but will be for any real application
    
    1. Test if it works correctly!
        
        1. Run `sls invoke local -f helloWorld`, should print:
            ```bash
            Time: 685ms
             Asset          Size          Chunks        Chunk Names
                handler.js  3.58 kB       0  [emitted]  handler
            handler.js.map  3.82 kB       0  [emitted]  handler
               [0] ./handler.js 796 bytes {0} [built]
               [1] external "babel-runtime/core-js/promise" 42 bytes {0} [not cacheable]
               [2] external "source-map-support/register" 42 bytes {0} [not cacheable]
            {
                "message": "Go Serverless Webpack (Ecma Script) v1.0! First module!",
                "event": ""
            }
            ```
    1. Test source maps too
    
        1. Change [handler.js](./handler.js) and add a syntax error
            ```
            .then(() => callback(null, {
              throw 'bouh' // Here
              message: 'Go Serverless Webpack (Ecma Script) v1.0! First module!',
              event,
            }))
            ```
        1. Run `sls invoke local -f helloWorld`
        1. It should print (on the server)
            ![](./ss/2018-02-25%2013.39.14%20-%20test%20source%20maps.png)
            
            We can see `ERROR in ./handler.js` with the line number. The stacktrace doesn't show the right line though. (if you know how to fix that, let met know!)
            
1. Add `serverless-offline` support for ease of development (see [serverless-offline](https://github.com/dherault/serverless-offline))
    
    1. Run `npm install serverless-offline --save-dev`
    1. Update `serverless.yml`
        ```
        plugins:
          - serverless-webpack
          - serverless-offline
        ```
    1. Run `sls offline`, should print:
        ![](./ss/2018-02-25%2014.00.09%20-%20sls%20offline.png)
        
    1. Go to http://localhost:3000/, it should print (on the browser)
        ![](./ss/2018-02-25%2014.02.18%20-%20sls%20offline%20not%20found.png)
    
    1. Go to http://localhost:3000/hello-world, it should print (on the server)
        ![](./ss/2018-02-25%2014.03.53%20-%20sls%20offline%20hello-world.png)
        (The web page should be blank)
    
    1. Serverless offline is a great tool to do the dev locally, by running a local node server to handle request and mock AWS lambda behavior for quick development.
        It isn't perfect (can't mock everything) but does help quite a lot.
        
1. Redirecting all requests to our handler entrypoint
    
    1. Update the `serverless.yml`:
        ```yml
        functions:
          helloWorld:
            handler: handler.helloWorld
            # The `events` block defines how to trigger the handler.helloWorld code
            events:
              - http:
                  method: get
                  path: /{proxy+} # This is what captures all get requests and redirect them to our handler.helloWorld function
        ```
    1. Now, go to:
        - http://localhost:3000/hello-world
        - http://localhost:3000/hello
        - http://localhost:3000/whatever
        - http://localhost:3000/whatever/nested
    1. You'll notice all of them return the same thing (on the server)