# AIM.js
Automatically label objects within images on websites so visually impaired users can read whats in the images. Relies on the API: librarylyna.com/api/auto-image-map/ for object detection 

## How to Use
- import AutoImageMaps.js 
~~~~
<script src="AIM.js"></script>
~~~~

- Call "generateImageMaps('img');" whenever new images are loaded 
- For example, in a static website call "generateImageMaps('img');" when everything is done loading 
~~~~
// When document is loaded make all image maps responsive
document.onreadystatechange = () => {
	if (document.readyState === 'complete') {
		generateImageMaps('img');
	}
};
~~~~



Copyright: 2017 - Kevin Yang