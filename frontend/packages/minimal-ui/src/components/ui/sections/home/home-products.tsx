'use client';

import type { BoxProps } from '@mui/system/Box';
import type { IPostItem, IPostFilters } from '@/types/blog';

import { orderBy } from 'es-toolkit';
import { useState, useCallback } from 'react';
import { useSetState } from 'minimal-shared/hooks';

import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';

import { Label } from '@/components/ui/label';
import { useGetPosts } from '@/ui/actions/blog';
import { MainAppContent } from '@/ui/layouts/MainApp';

import { PostList } from './products/post-list';



// ----------------------------------------------------------------------



export function HomeProducts({ sx, ...other }: BoxProps) {

  const PUBLISH_OPTIONS = ['all', 'published', 'draft'] as const;


  const { posts, postsLoading } = useGetPosts();

  const [sortBy] = useState('latest');

  const { state, setState } = useSetState<IPostFilters>({ publish: 'all' });

  const dataFiltered = applyFilter({ inputData: posts, filters: state, sortBy });

  const handleFilterPublish = useCallback(
    (event: React.SyntheticEvent, newValue: string) => {
      setState({ publish: newValue });
    },
    [setState]
  );

  return (
    <MainAppContent>




      <Tabs value={state.publish} onChange={handleFilterPublish} sx={{ mb: { xs: 3, md: 5 } }}>
        {PUBLISH_OPTIONS.map((tab) => (
          <Tab
            key={tab}
            iconPosition="end"
            value={tab}
            label={tab}
            icon={
              <Label
                variant={((tab === 'all' || tab === state.publish) && 'filled') || 'soft'}
                color={(tab === 'published' && 'info') || 'default'}
              >
                {tab === 'all' && posts.length}
                {tab === 'published' && posts.filter((post) => post.publish === 'published').length}
                {tab === 'draft' && posts.filter((post) => post.publish === 'draft').length}
              </Label>
            }
            sx={{ textTransform: 'capitalize' }}
          />
        ))}
      </Tabs>

      <PostList posts={dataFiltered} loading={postsLoading} />
    </MainAppContent>
  );
}

// ----------------------------------------------------------------------

type ApplyFilterProps = {
  inputData: IPostItem[];
  filters: IPostFilters;
  sortBy: string;
};

function applyFilter({ inputData, filters, sortBy }: ApplyFilterProps) {
  const { publish } = filters;

  if (sortBy === 'latest') {
    inputData = orderBy(inputData, ['createdAt'], ['desc']);
  }

  if (sortBy === 'oldest') {
    inputData = orderBy(inputData, ['createdAt'], ['asc']);
  }

  if (sortBy === 'popular') {
    inputData = orderBy(inputData, ['totalViews'], ['desc']);
  }

  if (publish !== 'all') {
    inputData = inputData.filter((post) => post.publish === publish);
  }

  return inputData;
}
