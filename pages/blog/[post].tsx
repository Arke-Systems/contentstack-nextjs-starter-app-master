import React, { useEffect, useState } from 'react';
import moment from 'moment';
import parse from 'html-react-parser';
import { getPageRes, getBlogPostRes } from '../../helper';
import { onEntryChange } from '../../contentstack-sdk';
import Skeleton from 'react-loading-skeleton';
import RenderComponents from '../../components/render-components';
import ArchiveRelative from '../../components/archive-relative';
import { Page, BlogPosts, PageUrl } from "../../typescript/pages";


export default function BlogPost({ blogPost, page, pageUrl }: {blogPost: BlogPosts, page: Page, pageUrl: PageUrl}) {

  const [getPost, setPost] = useState({ banner: page, post: blogPost });
  async function fetchData() {
    try {
      const entryRes = await getBlogPostRes(pageUrl);
      const bannerRes = await getPageRes('/blog');
      if (!entryRes || !bannerRes) throw new Error('Status: ' + 404);
      setPost({ banner: bannerRes, post: entryRes });
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    onEntryChange(() => fetchData());
  }, [blogPost]);

  const { post, banner } = getPost;
  return (
    <>
      {banner ? (
        <RenderComponents
          pageComponents={banner.page_components}
          blogPost
          contentTypeUid='blog_post'
          entryUid={banner?.uid}
          locale={banner?.locale}
        />
      ) : (
        <Skeleton height={400} />
      )}
      <div className='blog-container'>
        <article className='blog-detail'>
          {post && post.title ? (
            <h2 {...post.$?.title as {}}>{post.title}</h2>
          ) : (
            <h2>
              <Skeleton />
            </h2>
          )}
          {post && post.date ? (
            <p {...post.$?.date as {}}>
              {moment(post.date).format('ddd, MMM D YYYY')},{' '}
              <strong {...post.author[0].$?.title as {}} style={{ color: post.custom_color_picker ?? '#000000' }}>
                {post.author[0].title}
              </strong>
            </p>
          ) : (
            <p>
              <Skeleton width={300} />
            </p>
          )}
          {blogPost.featured_image && (
            <img
              className='blog-list-img'
              src={blogPost.featured_image.url}
              alt='blog img'
              {...blogPost.featured_image.$?.url as {}}
            />
          )}

          {post && post.body ? (
            <div {...post.$?.body as {}}>{parse(post.body)}</div>
          ) : (
            <Skeleton height={800} width={600} />
          )}
        </article>

        <article>
          <div>{parse(post.json_rte)}</div>
        </article>

        <div>
          {post && post.custom_color_picker ? (
            <p>{post.custom_color_picker}</p>
          ) : (
            <Skeleton width={100} />
          )}
        </div>
      </div>
    </>
  );
}
export async function getServerSideProps({ params }: any) {
  try {
    const page = await getPageRes('/blog');
    const posts = await getBlogPostRes(`/blog/${params.post}`);
    if (!page || !posts) throw new Error('404');

    return {
      props: {
        pageUrl: `/blog/${params.post}`,
        blogPost: posts,
        page,
      },
    };
  } catch (error) {
    console.error(error);
    return { notFound: true };
  }
}

