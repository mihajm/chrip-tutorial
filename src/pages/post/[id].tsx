import { type GetStaticProps, type NextPage } from 'next';
import Head from 'next/head';
import { PageLayout } from '~/components/layout';
import { PostView } from '~/components/post-view';
import { generateSSGHelper } from '~/server/helpers/ssg-helper';
import { api } from '~/utils/api';


const PostPage: NextPage<{id:string}> = ({id}) => {
  const {data: post}  = api.post.getOne.useQuery(id);

  if (!post) return <div>404 - Post not found</div>;


  return (
    <>
      <Head>
        <title>{post.content} - {`@${post.author.username}`}</title>
        <meta name="description" content={post.content} />
      </Head>

      <PageLayout>
        <PostView {...post} />
      </PageLayout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({params = {}}) => {
  const ssg = generateSSGHelper();

  const {id} = params;


  if (!id || typeof id !== 'string') throw new Error('Invalid ID');

  await ssg.post.getOne.prefetch(id);
  

  return {
    props: {
      trpcState: ssg.dehydrate(),
      id
    }
  };

};

export const getStaticPaths = () => {
  return {paths: [], fallback: 'blocking'};
};


export default PostPage;
