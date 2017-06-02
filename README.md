# coloring-book

<img width=100 align="right" src="https://aberke.github.io/fractals/img/sierpinski-triangle.png">

You may know of coloring books as a childhood amusement or as a means to adult relaxation. How about as a medium to explore the mathematics of symmetry?

This is a Coloring Book about Group Theory.  It is both digital and on paper.

By coloring on paper, readers can explore symmetry and the beauty of math.  
Following along on the digital copy to brings the concepts and illustrations to life in interactive animations.

http://coloring-book.co


The illustrations in this book are designed by algorithms that follow the symmetry rules of the groups that the illustrations belong to. These algorithms also use generative art techniques to add components of randomness - notice the illustrations never repeat.


##### Give Feedback // Get Updates

- http://coloring-book.co/form



## Posters

Printable posters available at <a href="http://www.coloring-book.co/#!/posters/">/#!/posters/</a>
- Includes printable frieze group posters


## Worksheets

- Worksheet at `/#!/worksheet`
	- Print this worksheet -- meant for Second Sunday at Pioneer Works
	- Designed to be printed in landscape mode on 11x17 paper
	
- Frieze pattern cards at `/#!/cards`
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
	- There should then be a `/dist/` directory of the compiled `src` files
- Run `$ gulp serve`
	- This uses `gulp watch` to recompile `src` files as they're updated
	- Or run the server in production mode with `$ npm start`
- Visit http://127.0.0.1/:5000

Can add parameter to URL to avoid page switch on hover of 'Preview Page' or 'Next Page'


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
	- `$ git push production `



## Printable Copy

Full PDF of book available at http://coloring-book.co/coloring-book.pdf

PDF/printable ready HTML book available at `/#!/print-book`


##### Notes:

Use the `?print` URL param to test printer friendly styling of the page

For regenerating the PDF at /coloring-book.pdf:
- Go to /#!/print-book
- Use Firefox browser (best obeys @page CSS specs)
- Make sure the illustrations look good (or click to recreate them)
- File -> print (Open the browser’s print dialog)
- Choose to have no headers & footers
- Choose portrait view & 8.5x11 (aka "letter") paper
- "Open PDF in Preview"
- Save as PDF at `/coloring-book.pdf`


### Pieces

Starting to generate & put together the pieces.  They are shown at /#!/pieces


### Making GIFs

Can upload images to combine into GIFs here: http://gifmaker.me/

#### Screencast to GIFs Workflow

- Use Quicktime player to take screencast
- Use https://giphy.com/create/gifmaker to convert .mov file to gif
- Use ?animate URL param to auto animate things on the page upon page load


### Notes:

#### Sharing

Share with http://www.coloring-book.co not http://coloring-book.co to avoid redirect


#### TODO:

- Fix the sometimes missing arrowhead from drawArrow

- Build/Gulp specific
	- concat + uglify JS
	- Do more linting
	- Build issues
		- at concat
		- needed to take out Raphael

- Frieze:
	- ? in frieze directive, adjust fundamental domain pattern height when shape has reflection so that frieze pattern takes up same height as other frieze patterns ?
	- better for standardizing around page size and printing

- fix google analytics
	- it would be nice to track what page people get to



#### Frieze Groups Notes

- See pages 70-76 of Isometrica for good examples from anthropological studies around the world


- p1: (T): Translation only
	- `ppppppp`

- p11m: (TH): Horizontal reflection
	- `>>>>>>>` OR `DCDCDCD`
	- mirror axis perpendicular to direction of repitition
	- And can only be found at center (for frieze groups)

- p1m1: (TV): Vertical reflection
	`pqpqpqpqp`
	-  multiple mirrors (perpendicular to translation vector)
	- 2 types, infinitely alternating, repeating
		- 1 bisects fundamental region
		- 1 separates 2 fundamental regions

- p11g: (TG): Glide reflection
	- `pbpbpbpb ------G` 
	- glide reflection axis parallel to repitition
	- minimal glide relection vector length = half length of minimal translation vector
		- because G^2 = T

- p2: (TR): 2 180° Rotations
	- `pdpdpdpd` OR `ZZZZZZZ`
	- distance between any 2 adjacent half-turn centers is half the minimal translation vector

- p2mg: (TVGR) 2 vertical mirrors, glide, rotation
	- `/|\/|\|/|\|/|\|/\------G` OR `pqbdpqbdpqbdpqbd------G`
	- rotation halfway between every 2 mirrors
	- 2 mirrors vertical to translation vector

- p2mm: (THVRG): Horizontal and Vertical reflection lines, 180° Rotations
	- Vertical reflections + Half-turns => Glide
	- `XXXXXXXXX---G` or `HHHHHHHHH`
	- Requires 3 generators. One generating set: (THV)


#### Generators

- p2mm "richest" in symmetry
	- can be reduced to p1m1 or p2mg by cutting off 2 pieces

- p2mm -> p1m1: reduce (THVR) -> (TH)
```
	|  ||  ||  ||	   |   |   |   |  
	------------   --> --  --  --  --
	|  ||  ||  ||
```

- p2mm -> p2mg : reduce (THVR) -> (TRV)
```
	|  ||  ||  ||	   |   ||    ||   
	------------   --> -----------
	|  ||  ||  || 		||    || 
```


#### Rules

- H -> G
	- H is G with trivial translation vector

- R + V => Glide reflection
- R + G => V
- V + G => R
-- R,V,G -> have 2 => 3rd always generated



### Ideas

Illustrate transformation from p1 to p1m1
(reverse every other motif)
p1: 	p p p p p p (animate shifting shift translation to..)
..: 	p 	p	p   (duplicate and flip)
p1m1:	p q p q p q


Illustrate p1 -> p11m
p1: 	b b b b b b
(animate flipping horizontally)
p11m:   b b b b b b
		p p p p p p

p1m1 -> p11g
p1m1:	\ \ \ \ \ \ \ 
		/ / / / / / /
disappear half the items
		\   \   \   \
		  /   /   /


Illustrate p11g -> p2mg
draw the curve of p11g: \  \  \  \
						  /  /  /  /
and then have it double back on itself
\/\/\/\/\/
/\/\/\/\/\

Illustrate p2mg <--> p2
p2mg:
	\/\/\/\/\/\/
	 /\/\/\/\/\/\
remove every other column
	\ \ \ \ \ \ \
	\ \ \ \ \ \ \
- All half turns preserved
- Reflections gone

p2mg -> p2mm
- Flip p2mg or shrink glide reflection vector to 0 (so that it is just a horizontal mirror)
p2mg:
\  /\  /\  /\  /\
 \/  \/  \/  \/  \
flip or shink glide reflection T vector	to get p2m2
\/\/\/\/\/\/\/\
/\/\/\/\/\/\/\/


Illustrate the many diffrent ways to generate p2mm
- requires 3 generators
- one generating set: a H, V, T:
	\ --H--> \ --V--> \/ --T--> \/\/\...
		     /		  /\		/\/\/

Illustrate p2mm -> p2mg
- Shifts bottom row of p2mm over one cell
\/\/\/\/\/\/ ---> \/\/\/\/\/\/
/\/\/\/\/\/\      \/\/\/\/\/\/\

