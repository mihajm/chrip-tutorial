import { type NextPage } from 'next';
import Head from 'next/head';


const PostPage: NextPage = () => {

  return (
    <>
      <Head>
        <title>Post</title>
        <meta name="description" content="Post" />
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
