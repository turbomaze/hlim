# _Hlim_

Hlim (HighLight IMage) is a bit of javascript that enables you to hide images in the background of highlighted text.

## Using Hlim

1. Include the javascript file in your project.
2. Add a `data-hlim-src` attribute to the html tag you wish to hlim-ify. Set it equal to the location of the image you wish to hide in the background (NOTE: the image must be hosted on the same web server as the javascript/html to avoid CORS issues). For example: 
```
<p data-hlim-src="cat.png">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec a diam lectus. Sed sit amet ipsum mauris. Maecenas congue ligula ac quam viverra nec consectetur ante hendrerit. Donec et mollis dolor. Praesent et diam eget libero egestas mattis sit amet vitae augue.
</p>
```

3. You can specify the width of the image (measured in characters), by adding a `data-hlim-width` attribute.
```
<p data-hlim-src="cat.png" data-hlim-width="80">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec a diam lectus. Sed sit amet ipsum mauris. Maecenas congue ligula ac quam viverra nec consectetur ante hendrerit. Donec et mollis dolor. Praesent et diam eget libero egestas mattis sit amet vitae augue.
</p>
```

4. When the images are finished loading (which might take a while...), the HTML is generated, and once that's done everything should be ready. Highlight and enjoy!

5. Images taking too long to generate? Try reducing the number of colors. Simple add a `data-hlim-max-colors` attribute for massive speed boosts.
```
<p data-hlim-src="cat.png" data-hlim-width="80" data-hlim-max-colors="2000">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec a diam lectus. Sed sit amet ipsum mauris. Maecenas congue ligula ac quam viverra nec consectetur ante hendrerit. Donec et mollis dolor. Praesent et diam eget libero egestas mattis sit amet vitae augue.
</p>
```

6. If you want to save the generated html/css, simply add a data-hlim-save attribute.
```
<p data-hlim-src="cat.png" data-hlim-width="80" data-hlim-max-colors="2000" data-hlim-save>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec a diam lectus. Sed sit amet ipsum mauris. Maecenas congue ligula ac quam viverra nec consectetur ante hendrerit. Donec et mollis dolor. Praesent et diam eget libero egestas mattis sit amet vitae augue.
</p>
```

## How It Works

1. For every hlim element, create an invisible canvas and draw the corresponding image to it. If the user wants to limit the number of colors used, then posterize the canvas before moving on. The width of the image should be set to the desired number of characters per line in the text-representation of the image. Store the image's pixels.

2. Go through all the pixels in all the images and create an array of unique colors.

3. Create a stylesheet that contains rules for every unique color, keeping track of which colors correspond to which rule. The rules should apply only to numbered color classes (like .hlim-color-1 to .hlim-color-500, for all the colors). Only change the color of the background when the color is selected with ::selected.

4. Iterate through the hlim elements again, and for each one, go through every character contained within. Process the characters in rows and columns. The number of characters per row should be specified by the user (fallback to the default). Treat each character's column/row as x/y coordinates in the source image. Get the color of the pixel, then look up which color class corresponds to that color. Output the character with that class and move on. When enough characters have been drawn to cover the whole image, you're done. Stop thinking about which class each character should get and just print out the rest. 

## License

Feel free to do whatever you want with Hlim. Just don't claim you made it ;).