# coloring-book

Open source, online coloring book through which one can explore the mathematics of symmetry and group theory.


### Notes:

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

- p112 (aka p2): (TR): 2 half-turns
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



#### Using RaphaelJS

- can you transform a paper.set() ?
	- YES
- can you have a paper.set() of sets?
	- YES
	- and YES you can assign attributes to all the members
- can you get the BBox (read: cordinates + width, height) of paper.set() ?
	- YES
	- use those values for transformations!
IDEA:
	- create the patterns with recursion

set = paper.set()
shape = create shape
set = set.push(shape) // set = [shape]

for action in actionsX1:
	clonedSet = set.clone()
	clonedSet = act on clonedSet

	// create set of sets
	newSet = paper.set()
	newSet.push(set)
	newSet.push(clonedSet)
	set = newSet

while set.getBBox.x2 < paperWidth:
	Translate




for translations:

- define path with syntax `path = "M10,30l50,0l-50,50l50,0";`
- always using relative coordinates
- to translate, update M.

- Can also use arrays to deliver coordinates: 
`var tri = paper.path([["M", 90, 90], ["L", 10, 70], ["L", 50, 5], ["L", 90, 90]]);` 
