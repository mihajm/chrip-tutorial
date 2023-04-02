import Image from 'next/image';
import Link from 'next/link';
import { createUsernameAlt } from '~/server/helpers/create-username-alt';
import { type RouterOutputs } from '~/utils/api';

type Author =  RouterOutputs['post']['getAll'][number]['author'];

export const ProfileImage = ({username, profileImageUrl}: Author) => {
  return (
    <Link href={`/@${username}`}>
      <Image
        src={profileImageUrl}
        alt={createUsernameAlt(username)}
        className="h-14 w-14 rounded-full"
        width="56"
        height="56"/>
    </Link>
  );
};
