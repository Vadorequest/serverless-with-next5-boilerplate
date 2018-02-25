import React from 'react'

export default () => {
  return (
    <div>
      Hello world!
      <br />
      <img src={'/static/serverless.svg'} alt={'Serverless logo'} height={50} width={50} />&nbsp;Serverless<br />
      <img src={'/static/nextjs.png'} alt={'Next.js logo'} />
    </div>
  );
};