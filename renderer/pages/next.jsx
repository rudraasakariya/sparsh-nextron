import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

function Next() {
  
  return (
    <React.Fragment>
      <Head>
        <title>Next - Nextron (with-javascript)</title>
      </Head>
      <div>
        <p>
          ⚡ Electron + Next.js ⚡ -
          <Link href="/home">
            <a>Go to home page</a>
          </Link>
          {
            // Add a button to get the file path from the clipboard
          }
          <button onClick={() => {
            const fP = NativeFile.getFileFromClipboard();

            NativeFile.readFile(fP)
              .then((data) => {
                console.log(data.toString());
              })
              .catch((err) => {
                console.error(err);
              });
          }}>Get file path from clipboard</button>
        </p>
      </div>
    </React.Fragment>
  );
};

export default Next;
