import { type NextPage } from 'next';
import Head from 'next/head';






const PostPage: NextPage = () => {

  return (
    <>
      <Head>
        <title>Chirp tutorial</title>
        <meta name="description" content="Tutorial twitter clone, built with t3" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex h-screen justify-center ">
        <div>
          post
        </div>

      </main>
    </>
  );
};

export default PostPage;
