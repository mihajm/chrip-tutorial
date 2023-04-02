import { type NextPage } from 'next';
import Head from 'next/head';



const ProfilePage: NextPage = () => {


  return (
    <>
      <Head>
        <title>Chirp tutorial</title>
        <meta name="description" content="Tutorial twitter clone, built with t3" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex h-screen justify-center ">
        <div>profile</div>
      </main>
    </>
  );
};

export default ProfilePage;
