# Ponderings on Screeps automation

## The Story so Far

Basically started with the tutorial code along with some additional code from [Screeps Nooby Guide video series](https://www.youtube.com/playlist?list=PL0EZQ169YGlor5rzeJEYYPE3tGYT2zGT2) (which code is somewhat out of date, but still useful for learning).

With that starting point, and only playing in the Training rooms so far, I have:
* Automated the creation and directions of creeps to Build, Upgrade, and Harvest
* Automated the created of a HeavyBuilder (only kicks in after energy soource extensions are ready)
* Automated the creation of energy source extensions (based on the room controller level)

Prioritizes work:
* Prioritizes harvesting over upgrading over building
* Redirects builders to harvesting when idle
* Resitrects harvesters to upgraders with idle (and so builders->harvesters->upgraders)

Does not:
* build roads,walls,etc. (unless manually placed construction sites)
* defend against attackers
* any of the advanced skills (mining, manufacturing, trading, etc.)


## 

Todo:

* Target specific creeps to tasks (instead of classes of creeps to types of tasks)
* Limit creeps harvesting from source based on source accessibility limtes (e.g. Training Sim source can only support 3 harvesters)


