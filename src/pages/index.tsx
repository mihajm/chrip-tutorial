import { SignInButton, useUser } from '@clerk/nextjs';

import { api, type RouterOutputs } from '~/utils/api';

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { type NextPage } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { PageLayout } from '~/components/layout';
import { LoadingPage, LoadingSpinner } from '~/components/loading';
import { createUsernameAlt } from '~/server/helpers/create-username-alt';

dayjs.extend(relativeTime);

type PostWithAuthor = RouterOutputs['post']['getAll'][number];

type Author = PostWithAuthor['author'];



const ProfileImage = ({username, profileImageUrl}: Author) => {
  return <Image src={profileImageUrl} alt={createUsernameAlt(username)} className="h-14 w-14 rounded-full" width="56" height="56"/>;
};

const isValidInput = (input?: string) => !!input && input.length >= 1 && input.length <= 144;

const CreatePostWizard = () => {
  const {user} = useUser();
  const [input, setInput] = useState('');


  const utils = api.useContext();

  const {mutate, isLoading: isPosting} = api.post.create.useMutation({
    onMutate: async ({content}) => {
      if (!user || !user.username) return;
      await utils.post.getAll.cancel();

      const newPost = {
        content,
        id: 'temp',
        createdAt: new Date(),
        author: {
          username: user.username,
          id: user.id,
          profileImageUrl: user.profileImageUrl
        }
      };

      const prevData = utils.post.getAll.getData() || [];
      utils.post.getAll.setData(undefined, [newPost, ...prevData]);

      return {prevData};
    },
    onError: (e, _, ctx) => {
      const msg = e.data?.zodError?.fieldErrors.content;
      void utils.post.getAll.setData(undefined, ctx?.prevData);
      if (!msg || !msg[0]) {
        return toast.error('Something went wrong', {
          position: 'bottom-center'
        });
      }
      toast.error(msg[0], {
        position: 'bottom-center'
      });

    },
    onSettled: () => {
      void utils.post.getAll.invalidate();
    }
  });

  if (!user || !user.username) return null;
  
  
  return (
    <div className='flex gap-3 w-full grow items-center'>
      <ProfileImage {...user} username={user.username} />
      <div className='grow relative flex'>
        <input 
          placeholder='Type your chirp here...' 
          className='bg-transparent grow outline-none'
          value={input} 
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key !== 'Enter' || !isValidInput(input)) return;
            mutate({content: input});
          }}
          disabled={isPosting}
        />
        {input.length > 144 && <span className='absolute left-0 -bottom-4 text-red-300 text-xs'>Must be less than 144 characters</span>}
      </div>

      <button 
        onClick={() => {
          if (!isValidInput(input)) return;
          mutate({content: input});
        }} 
        className='flex items-center gap-2 bg-blue-500 text-white rounded px-4 py-2 disabled:bg-gray-400 hover:bg-blue-600 active:bg-blue-600'
        disabled={isPosting || !isValidInput(input)}
      >
        Chirp
        {isPosting && <LoadingSpinner />}
      </button>
    </div>
  );
};


const PostView = ({content, createdAt, author, id: postId}:  PostWithAuthor) => {


  return <div className=" border-b border-slate-400 p-4 flex align gap-3" >
    <ProfileImage {...author} />
    <div className='flex flex-col'>
      <div className='flex text-slate-300 gap-1'>
        <Link href={`/@${author.username}`}>
          <span>{`@${author.username}`}</span>
        </Link>
        <span className="font-thin">·</span>
        <Link href={`/post/${postId}`}>
          <span className="font-thin">{dayjs(createdAt).fromNow()}</span>
        </Link>
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
    <PageLayout>
      <div className="border-b border-slate-400 p-4 flex">
        <div className="flex justify-center grow">
          {!isSignedIn && <SignInButton />}
          {isSignedIn && <CreatePostWizard />}
        </div>
      </div>
      <Feed />
    </PageLayout>
  );
};

export default Home;
