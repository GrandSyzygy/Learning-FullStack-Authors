// import all :root styles from all css documents
const rootStyles = window.getComputedStyle(document.documentElement)

// check to see if property to set before using
if(rootStyles.getPropertyValue('--book-cover-width-large') != null &&
  rootStyles.getPropertyValue('--book-cover-width-large') !== '') {
  ready()
} else {
  // event listener for when 'main-css' is loaded
  document.getElementById('main-css')
  .addEventListener('load', ready)
}

function ready() {
  const coverWidth = parseFloat(rootStyles.getPropertyValue('--book-cover-width-large'))
  const coverAspectRatio = parseFloat(rootStyles.getPropertyValue('--book-cover-aspect-ratio'))
  const coverHeight = coverWidth / coverAspectRatio

  FilePond.registerPlugin(
    FilePondPluginImagePreview,
    FilePondPluginImageResize,
    FilePondPluginFileEncode
  )

  FilePond.setOptions({
    stylePanelAspectRatio: 1 / coverAspectRatio,
    imageResizeTargetWidth: coverWidth,
    imageResizeTargetHeight: coverHeight
  })

  FilePond.parse(document.body);
}
