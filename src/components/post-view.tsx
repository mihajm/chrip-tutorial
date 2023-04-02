import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import Link from 'next/link';
import { type RouterOutputs } from '~/utils/api';
import { ProfileImage } from './profile-image';

dayjs.extend(relativeTime);

type PostWithAuthor = RouterOutputs['post']['getAll'][number];

export const PostView = ({content, createdAt, author, id: postId}:  PostWithAuthor) => {


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