const routes = [
  {
    path: '/',
    /*component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') }
    ]*/
    component: () => import('src/layouts/ViewerComponent.vue'),
    children: [
      { path: '', component: () => import('/src/pages/GraphComponent.vue') }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
