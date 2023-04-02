import { SignInButton, useUser } from '@clerk/nextjs';
import { type NextPage } from 'next';
import Head from 'next/head';

import { api, type RouterOutputs } from '~/utils/api';

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import Image from 'next/image';
import { useState } from 'react';
import { LoadingPage } from '~/components/loading';

dayjs.extend(relativeTime);

type PostWithAuthor = RouterOutputs['post']['getAll'][number];

type Author = PostWithAuthor['author'];

const createUsernameAlt = (un: string) => {
  const pn = 'profile image';
  if (!un) return pn;
  return un + ' ' + pn;
};

const ProfileImage = ({username, profileImageUrl}: Author) => {
  return <Image src={profileImageUrl} alt={createUsernameAlt(username)} className="h-14 w-14 rounded-full" width="56" height="56"/>;
};

const CreatePostWizard = () => {
  const {user} = useUser();
  const [input, setInput] = useState('');

  const ctx = api.useContext();

  const {mutate, isLoading: isPosting} = api.post.create.useMutation({
    onSuccess: () => {
      setInput('');
      void ctx.post.getAll.invalidate();
    }
  });

  if (!user || !user.username) return null;
  
  
  return (
    <div className='flex gap-3 w-full grow items-center'>
      <ProfileImage {...user} username={user.username} />
      <input 
        placeholder='Type your chirp here...' 
        className='bg-transparent grow outline-none'
        value={input} 
        onChange={(e) => setInput(e.target.value)}
        disabled={isPosting}/>
      <button 
        onClick={() => mutate({content: input})} 
        className='bg-blue-500 text-white rounded px-6 py-2'>Chirp</button>
    </div>
  );
};


const PostView = ({content, createdAt, author}:  PostWithAuthor) => {


  return <div className=" border-b border-slate-400 p-4 flex align gap-3" >
    <ProfileImage {...author} />
    <div className='flex flex-col'>
      <div className='flex text-slate-300 gap-1'>
        <span>{`@${author.username}`}</span>
        <span className="font-thin">·</span>
        <span className="font-thin">{dayjs(createdAt).fromNow()}</span>
      </div>
      <span className='text-xl'>{content}</span>
    </div>
  </div>;

};

const Feed = () => {
  const {data, isLoading} = api.post.getAll.useQuery();

  if (isLoading) return <LoadingPage />;

  if (!data) return <div>Something went wrong</div>;


  return (
    <div className="flex flex-col">
      {data.map((p) => <PostView key={p.id} {...p} />)}
    </div>
  );
};


const Home: NextPage = () => {

  const {isSignedIn, isLoaded} = useUser();
  api.post.getAll.useQuery();


  if (!isLoaded) return <div />;


  return (
    <>
      <Head>
        <title>Chirp tutorial</title>
        <meta name="description" content="Tutorial twitter clone, built with t3" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex h-screen justify-center ">
        <div className="h-full w-full md:max-w-2xl border-x border-slate-400">
          <div className="border-b border-slate-400 p-4 flex">
            <div className="flex justify-center grow">
              {!isSignedIn && <SignInButton />}
              {isSignedIn && <CreatePostWizard />}
            </div>
          </div>
          <Feed />
        </div>

      </main>
    </>
  );
};

export default Home;
