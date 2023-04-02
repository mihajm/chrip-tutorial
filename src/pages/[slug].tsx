import type { GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import { PageLayout } from '~/components/layout';
import { LoadingPage } from '~/components/loading';
import { PostView } from '~/components/post-view';
import { createUsernameAlt } from '~/server/helpers/create-username-alt';
import { generateSSGHelper } from '~/server/helpers/ssg-helper';
import { api } from '~/utils/api';

type PageProps = {username: string};


const ProfileFeed = (props: {authorId: string}) => {
  const {data: posts, isLoading} = api.post.getPostsForUser.useQuery(props);

  if (isLoading) return <LoadingPage />;

  if (!posts || !posts.length) return <div>No posts</div>;

  return (
    <div className="flex flex-col  h-full overflow-y-auto">
      {posts.map((post) => <PostView key={post.id} {...post} />) }
    </div>
  );
};

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
        <ProfileFeed authorId={user.id} />
      </PageLayout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({params = {}}) => {
  const ssg = generateSSGHelper();

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
