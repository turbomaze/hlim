# _Hlim_

Hlim (HighLight IMage) is a bit of javascript that enables you to hide images in the background of highlighted text.

## Using Hlim

1. Include the javascript file in your project (NOTE: must be accessed via a web server to avoid CORS issues).
2. Add a `data-hlim-src` attribute to the html tag you wish to hlim-ify. Set it equal to the location of the image you wish to hide in the background. For example: 
```
<p data-hlim-src="dog.png">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec a diam lectus. Sed sit amet ipsum mauris. Maecenas congue ligula ac quam viverra nec consectetur ante hendrerit. Donec et mollis dolor. Praesent et diam eget libero egestas mattis sit amet vitae augue.
</p>
```

3. You can specify the width of the image (measured in characters), by adding a `data-hlim-width` attribute.
```
<p data-hlim-src="dog.png" data-hlim-width="80">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec a diam lectus. Sed sit amet ipsum mauris. Maecenas congue ligula ac quam viverra nec consectetur ante hendrerit. Donec et mollis dolor. Praesent et diam eget libero egestas mattis sit amet vitae augue.
</p>
```

4. When the images are finished loading, the HTML is generated, and once that's done everything should be ready. Highlight and enjoy!

## License

Feel free to do whatever you want with Hlim. Just don't claim you made it ;).