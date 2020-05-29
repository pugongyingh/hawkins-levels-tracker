const _ = require('lodash')
const path = require('path')
const { createFilePath } = require('gatsby-source-filesystem')
const { fmImagesToRelative } = require('gatsby-remark-relative-images')

exports.createPages = ({ actions, graphql }) => {
  const { createPage } = actions

  return graphql(`
    {
      allMarkdownRemark(filter: {fileAbsolutePath: {regex: "/static\/pages\//"}}, limit: 10) {
        edges {
          node {
            id
            fields {
              slug
            }
            frontmatter {
              templateKey
              locale
            }
          }
        }
      }
    }
  `).then(result => {
    if (result.errors) {
      result.errors.forEach(e => console.error(e.toString()))
      return Promise.reject(result.errors)
    }

    const posts = result.data.allMarkdownRemark.edges

    posts.forEach(edge => {
      const id = edge.node.id
      const locale = edge.node.frontmatter.locale
      let slug = "";


      slug = locale !== 'cs' ? "/" + locale : '';

      if (!edge.node.fields.slug.match(/^\/index/)) {
        slug += edge.node.fields.slug;
      }

      const match = slug.search(/-\d+\/$/);
      if (match !== -1) {
        slug = slug.replace(/-\d+\/$/, '')
      }

      if (slug[slug.length - 1] !== "/") {
        slug += "/";
      }

      createPage({
        path: slug,
        component: path.resolve(
          `src/pages/${String(edge.node.frontmatter.templateKey)}.tsx`
        ),
        // additional data can be passed via context
        context: {
          id,
          locale
        },
      })
    })
  })
}

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions
  fmImagesToRelative(node) // convert image paths for gatsby images

  if (node.internal.type === `MarkdownRemark`) {
    const value = createFilePath({ node, getNode })
    createNodeField({
      name: `slug`,
      node,
      value,
    })
  }
}
