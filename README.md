# coloring-book

You may know of coloring books as a childhood amusement or as a means to adult relaxation. How about as a medium to explore the mathematics of symmetry?

This is a Coloring Book about Group Theory.  It is both digital and on paper.
![alt text](src/assets/img/cn/c9.png?raw=true "cn shape")

By coloring on paper, readers can explore symmetry and the beauty of math.  
Following along on the digital copy to brings the concepts and illustrations to life in interactive animations.

http://coloring-book.co

The illustrations in this book are drawn in javascript by algorithms that follow the symmetry rules of the groups that the illustrations belong to. These algorithms also use generative art techniques to add components of randomness - notice the illustrations never repeat.


## Coloring Workbook

This book is in the process of being transformed into more of a 'workbook' for publication.

View/Play at http://bit.ly/stagingcolors


## Why a Coloring Book?

The content in this "book" is presented in the form of a coloring book for multiple reasons: [link](https://docs.google.com/document/d/1G8_m8-pwwpQ8AMAWEnYDEEn6rdC7crGaKBcHETBa_F0/edit?usp=sharing)


## Contribute

Yes please.
This is an open source project and contributions are greatly appreciated.


#### Non-Technical Contributions: Give Feedback // Get Updates

- http://coloring-book.co/form


#### Technical Contributions

Please see below on how to get started with running the project locally. The project's [ISSUES](https://github.com/aberke/coloring-book/issues) lists known bugs and areas of improvement.  You are more than invited to submit pull requests to resolve these, or any other areas of improvement you are aware of.
Thanks <3


## Posters

Printable posters available at <a href="http://www.coloring-book.co/posters">/posters</a>
- Includes printable frieze group posters


### Playful Pages

- Create a circular pattern: [/circular-pattern](http://www.coloring-book.co/circular-pattern)

- Frieze Groups explorer: [/frieze](http://www.coloring-book.co/frieze)

- Wallpaper Groups explorer: [/wallpaper](http://www.coloring-book.co/wallpaper)

- Guide to symmetries in the plane: [/symmetries](http://www.coloring-book.co/symmetries)
	- Add parameter `?print` for version formatted for printing


## Worksheets

- Worksheet at <a href="http://www.coloring-book.co/worksheet">/worksheet</a>
	- Print this worksheet -- meant for Second Sunday at Pioneer Works
	- Designed to be printed in landscape mode on 11x17 paper
	
- Frieze pattern cards at <a href="http://www.coloring-book.co/cards">/cards</a>
	- Print and cut into cards with one pattern piece per card.
	- Try to arrange these cards to generate the Frieze Patterns.



## Development

- Clone the repo `$ git clone git@github.com:aberke/coloring-book.git`

Fractals Submodule:
This repo uses a submodule, which is the `fractals` directory.  This will initally be empty.
- Fill the fractals directory: run `git submodule update --init --recursive`
- To pull in changes from the `fractals` submodule, run `$ git submodule update --recursive --remote`

Files are transpiled and built to `/dist` by gulp and are served by a node http-server.

- Install node modules `$ npm install`
- Build with gulp `$ gulp build`
	- There should then be a `/dist/` directory of the processed `src` files
- Run `$ gulp serve`
	- This uses `gulp watch` to reprocess `src` files as they're updated
- Visit http://127.0.0.1:5000

Run/Build in production mode with `--production` flag.

- This also concatenates + minifies the files.
- `$ gulp build --production`
- `$ gulp serve --production`


#### Debugging

URL parameters:

- `?debug`


#### Linting

Please rememember to lint: `$ gulp lint`

- Uses jshint to lint Javascript via gulp via `$ gulp lint` command
- jshint settings are in `.jshintrc` and ignore paths are in `.jshintignore`


## Deployment

- Production is deployed on heroku at http://coloring-book.herokuapp.com
	- Uses http server to serve assets.  Reason: this allows AngularJS includes.
- Staging is deployed at https://coloring-book-staging.herokuapp.com

ALWAYS push to Staging before production.

Git Config looks something like:
```
...
[remote "origin"]
        url = git@github.com:aberke/coloring-book.git
        fetch = +refs/heads/*:refs/remotes/origin/*
[branch "master"]
        remote = origin
        merge = refs/heads/master
[submodule "fractals"]
        url = https://github.com/aberke/fractals
[remote "production"]
        url = https://git.heroku.com/coloring-book.git
        fetch = +refs/heads/*:refs/remotes/heroku/*
[remote "staging"]
        url = https://git.heroku.com/coloring-book-staging.git
        fetch = +refs/heads/*:refs/remotes/staging/*
```
Workflow:

- Feature done, looks good, push to staging
	- `$ git push staging <branch-name>`
- Staging looks good, push to production
	- `$ git push production`


### Style Guide

Use the [/style-guide](http://www.coloring-book.co/style-guide)


## Printable Copy

Full PDF of book available at http://coloring-book.co/book.pdf

PDF/printable ready HTML book available at `/print-book`

This book is designed for print with 7" x 9" trim size.
It can also be printed on standard 8.5x11 (aka "letter") paper


#### For regenerating the PDF at /coloring-book.pdf:

- Use Firefox browser (best obeys @page CSS specs)
- Use File > Page Setup to create (custom) page size with 7"x9" dimensions
- Go to /print-book
- Make sure the illustrations look good (or click to recreate them)
- File > Print (Open the browser’s print dialog)
- "Open PDF in Preview"
- There may be extra blank pages.  Sorry, CSS is hard.  Delete them.
- Save as PDF at `/book.pdf`


### Helpful URL parameters:

- `?disable-animations` to disable animations
- `?print` to test printer friendly styling of the page
	- This will also disable animations (for better browser performance)
- `?debug`


## Making Art Assets

### Wallpaper Patterns

- Can optionally contain within maximum height via URL parater `?height=HEIGHT`

### Making GIFs

Can upload images to combine into GIFs here: http://gifmaker.me/

#### Screencast to GIFs Workflow

- Use Quicktime player to take screencast
- Use ?animate URL param to auto animate things on the page upon page load
- Use PicGIF (downloaded for mac) to convert movie --> GIF
- OR Use https://giphy.com/create/gifmaker to convert .mov file to gif



### Pieces

/pieces


### Notes:

#### Sharing

Share with http://www.coloring-book.co not http://coloring-book.co to avoid redirect


### License


<a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/4.0/"><img alt="Creative Commons License" style="border-width:0" src="https://i.creativecommons.org/l/by-nc-sa/4.0/88x31.png" /></a><br />This work is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/4.0/">Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License</a>.
