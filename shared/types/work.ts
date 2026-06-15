export type TagItem = {
  id: number;
  name: string;
};

export type ImageItem = {
  id: string;
  path: string;
};

export type AdminWorkItem = {
  id: string;
  title: string;
  slug: string;
  category: string;
  tags: TagItem[];
  cover: {
    id: string;
    path: string;
  };
  images: ImageItem[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
};

export type WorkItem = Omit<AdminWorkItem, 'isPublic'>;
