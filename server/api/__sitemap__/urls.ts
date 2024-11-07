import { serverQueryContent } from '#content/server'
import { defineSitemapEventHandler } from '#imports'

export default defineSitemapEventHandler(async (e) => {
  const contentList = await serverQueryContent(e, 'agendas').find()

  return contentList
    .map((c) => {
      return asSitemapUrl({
        loc: c._path?.replace('agendas', 'agenda') || '',
      })
    })
})
