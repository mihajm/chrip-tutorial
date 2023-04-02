import { createProxySSGHelpers } from '@trpc/react-query/ssg';
import type { GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import SuperJSON from 'superjson';
import { PageLayout } from '~/components/layout';
import { appRouter } from '~/server/api/root';
import { prisma } from '~/server/db';
import { createUsernameAlt } from '~/server/helpers/create-username-alt';
import { api } from '~/utils/api';

type PageProps = {username: string};

const ProfilePage: NextPage<PageProps> = ({username}) => {
  const {data: user} = api.user.getUserByUsername.useQuery({
    username: 'mihajm'
  });

  if (!user) return <div>404 - User not found</div>;
  

  return (
    <>
      <Head>
        <title>{`Profile - ${username}`}</title>
        <meta name="description" content={`Profile for: ${username}`} />
      </Head>
      <PageLayout>
        <div className="h-36 border-slate-400 bg-slate-600 relative">
          <Image
            src={user.profileImageUrl}
            alt={createUsernameAlt(username)}
            height="128"
            width="128"
            className=' absolute bottom-0 left-0 -mb-[64px] rounded-full border-4 border-black bg-black ml-4'
          /> 
        </div>
        <div className="h-[64px]"></div>
        <div className="p-4 text-2xl font-semibold">
          {`@${username}`}
        </div>
        <div className='border-b border-slate-400'>

        </div>
      </PageLayout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({params = {}}) => {
  const ssg = createProxySSGHelpers({
    router: appRouter,
    ctx: {
      prisma,
      currentUser: null,
    },
    transformer: SuperJSON,
  });

  const {slug} = params;

  if (!slug || typeof slug !== 'string') throw new Error('Invalid slug');

  const username = slug.replace(/@/g, '');

  await ssg.user.getUserByUsername.prefetch({
    username: username
  });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      username
    }
  };
};

export const getStaticPaths = () => {
  return {paths: [], fallback: 'blocking'};
};

export default ProfilePage;
