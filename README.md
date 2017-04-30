# coloring-book

<img width=100 align="right" src="https://aberke.github.io/fractals/img/sierpinski-triangle.png">

You might know of coloring books as a childhood amusement or as a means to adult relaxation. How about as a medium to teach the mathematics of group theory? Come color on the walls, interact with mathematical animations, and learn more about the beauty of math.

This is an open source, online coloring book through which one can explore the mathematics of symmetry and group theory.  Start coloring.

http://coloring-book.co


## Export to Print/Save

In order to export the book to printable version, or save it as printable PDF:

- Works best with Firefox browser
- Select to show no headers and only center page number as footer
- "Preview as PDF"


## Prints

Full printable designs available at `/prints/`


#### Frieze Prints

(TODO)


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

- Add `?develop` as URL parameter


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


### Pieces

Starting to generate & put together the pieces.  They are shown at /pieces


# TODO:

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


- make /printable for where all pages are displayed together

- standardize size for pages
	- they should all be the same height -- easier printing too

- sprinkle in some flowers -- see the circular flowers in the pieces

- enable printable param ?print
	- use a larger page controller to check for param and add an extra class to the <body>

- fix google analytics
	- it would be nice to track what page people get to


#### Screencast to GIFs Workflow

- Use Quicktime player to take screencast
- Use Drop to GIF to convert .mov file to gif
- Use ?animate URL param to auto animate things on the page upon page load


### Notes:

#### Sharing

Share with http://www.coloring-book.co not http://coloring-book.co to avoid redirect


#### RaphaelJS

- paper.clear() removes the SVG path

#### Frieze Groups

- See pages 70-76 for good examples from anthropological studies around the world


- p1111 (aka p1): (T): Translation only
	- `ppppppp`

- p1m1 (aka p11m ?): (TH): Horizontal reflection
	- `>>>>>>>` OR `DCDCDCD`
	- mirror axis perpendicular to direction of repitition
	- And can only be found at center (for frieze groups)

- pm1 (aka p1m1?): (TV): Vertical reflection
	`pqpqpqpqp`
	-  multiple mirrors (perpendicular to translation vector)
	- 2 types, infinitely alternating, repeating
		- 1 bisects fundamental region
		- 1 separates 2 fundamental regions

- p1a1 (aka p11g): (TG): Glide reflection
	- `pbpbpbpb ------G` 
	- glide reflection axis parallel to repitition
	- minimal glide relection vector length = half length of minimal translation vector
		- because G^2 = T

- p112 (aka p2): (TR): 2 180° Rotations
	- `pdpdpdpd` OR `ZZZZZZZ`
	- distance between any 2 adjacent half-turn centers is half the minimal translation vector

- pma2 (aka p2mg): (TVGR) 2 vertical mirrors, glide, rotation
	- `/|\/|\|/|\|/|\|/\------G` OR `pqbdpqbdpqbdpqbd------G`
	- rotation halfway between every 2 mirrors
	- 2 mirrors vertical to translation vector

- pmm2 (aka p2mm): (THVRG): Horizontal and Vertical reflection lines, 180° Rotations
	- Vertical reflections + Half-turns => Glide
	- `XXXXXXXXX---G` or `HHHHHHHHH`
	- Requires 3 generators. One generating set: (THV)


#### Generators

- pmm2 "richest" in symmetry
	- can be reduced to p1m1 or pma2 by cutting off 2 pieces

- pmm2 -> p1m1: reduce (THVR) -> (TH)
```
	|  ||  ||  ||	   |   |   |   |  
	------------   --> --  --  --  --
	|  ||  ||  ||
```

- pmm2 -> pma2 : reduce (THVR) -> (TRV)
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

Illustrate transformation from p111 to pm1
(reverse every other motif)
p1111: 	p p p p p p (animate shifting shift translation to..)
..: 	p 	p	p   (duplicate and flip)
pm1:	p q p q p q


Illustrate p1111 -> p1m1
p1111: 	b b b b b b
(animate flipping horizontally)
p1m1:   b b b b b b
		p p p p p p

p1m1 -> p1a1
p1m1:	\ \ \ \ \ \ \ 
		/ / / / / / /
disappear half the items
		\   \   \   \
		  /   /   /


Illustrate p1a1 -> pma2
draw the curve of p1a1: \  \  \  \
						  /  /  /  /
and then have it double back on itself
\/\/\/\/\/
/\/\/\/\/\

Illustrate pma2 <--> p112
pma2:
	\/\/\/\/\/\/
	 /\/\/\/\/\/\
remove every other column
	\ \ \ \ \ \ \
	\ \ \ \ \ \ \
- All half turns preserved
- Reflections gone

pma2 -> pmm2
- Flip pma2 or shrink glide reflection vector to 0 (so that it is just a horizontal mirror)
pma2:
\  /\  /\  /\  /\
 \/  \/  \/  \/  \
flip or shink glide reflection T vector	to get p2m2
\/\/\/\/\/\/\/\
/\/\/\/\/\/\/\/


Illustrate the many diffrent ways to generate pmm2
- requires 3 generators
- one generating set: a H, V, T:
	\ --H--> \ --V--> \/ --T--> \/\/\...
		     /		  /\		/\/\/

Illustrate pmm2 -> pma2
- Shifts bottom row of pmm2 over one cell
\/\/\/\/\/\/ ---> \/\/\/\/\/\/
/\/\/\/\/\/\      \/\/\/\/\/\/\

