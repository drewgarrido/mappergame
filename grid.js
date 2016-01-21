"use strict";
/*
    Copyright 2016 Drew Garrido

    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; either version 2 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program; if not, write to the Free Software
    Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston,
    MA 02110-1301, USA.
*/

var Node = function(xp, yp)
{
    this.location = new Vector2D(xp, yp);
    this.neighbors = [];
    this.costSoFar = Number.MAX_VALUE;
    this.costTo = 1;
    this.connected = true;
    this.cameFrom;
};

var Grid = function(widthp, heightp)
{
    this.nodes = [];
    this.width = widthp;
    this.height = heightp;

    this.initializeGrid = function()
    {
        var x, y, node;

        for (x = 0; x < this.width; x++)
        {
            this.nodes.push([]);

            for (y = 0; y < this.height; y++)
            {
                this.nodes[x].push(new Node(x,y));
            }
        }

        for (x = 0; x < this.width; x++)
        {
            for (y = 0; y < this.height; y++)
            {
                node = this.nodes[x][y];
                node.neighbors = [];
                if (x > 0)
                {
                    node.neighbors.push(this.nodes[x-1][y]);
                }
                if (x < this.width - 1)
                {
                    node.neighbors.push(this.nodes[x+1][y]);
                }
                if (y > 0)
                {
                    node.neighbors.push(this.nodes[x][y-1]);
                }
                if (y < this.height - 1)
                {
                    node.neighbors.push(this.nodes[x][y+1]);
                }
            }
        }

        this.resetGridConnections();
    };

    this.resetGridConnections = function()
    {
        var x, y;

        for (x = 0; x < this.width; x++)
        {
            for (y = 0; y < this.height; y++)
            {
                this.nodes[x][y].connected = true;
                this.nodes[x][y].cameFrom = undefined;
                this.nodes[x][y].costSoFar = Number.MAX_VALUE;
            }
        }
    };

    this.resetGridPath = function()
    {
        var x, y;

        for (x = 0; x < this.width; x++)
        {
            for (y = 0; y < this.height; y++)
            {
                this.nodes[x][y].cameFrom = undefined;
                this.nodes[x][y].costSoFar = Number.MAX_VALUE;
            }
        }
    };

    this.updateGridConnections = function(walls)
    {
        var i, startX, startY, endX, endY;

        for (i = 0; i < walls.length; i++)
        {
            startX = Math.max(0, walls[i].x - 32);
            startY = Math.max(0, walls[i].y - 32);
            endX = Math.min(this.width, walls[i].x + 32);
            endY = Math.min(this.height, walls[i].y + 32);

            for (var x = startX; x < endX; x++)
            {
                for (var y = startY; y < endY; y++)
                {
                    this.nodes[x][y].connected = false;
                }
            }
        }
    };


    this.dijkstraToClosestGoal = function(startPoint, goalPoints)
    {
        var startNode = this.nodes[startPoint.x][startPoint.y];
        var frontier = [startNode];    // Priority queue
        var currentNode, nextNode, goalNode;
        var newCost = 0;
        var reversePath = [];
        var path = [];
        var idx, neighIdx;

        this.resetGridPath();

        startNode.costSoFar = 0;

        while (frontier.length > 0 && goalNode === undefined)
        {
            currentNode = frontier.shift();

            for (idx = 0; idx < goalPoints.length; idx++)
            {
                if (currentNode.location.isEqual(goalPoints[idx]))
                {
                    goalNode = currentNode;
                    break;
                }
            }

            if (goalNode === undefined)
            {
                for (neighIdx = 0;
                     neighIdx < currentNode.neighbors.length;
                     neighIdx++)
                {
                    nextNode = currentNode.neighbors[neighIdx];
                    newCost = currentNode.costSoFar + nextNode.costTo;

                    if (nextNode.connected &&
                        newCost < nextNode.costSoFar)
                    {
                        nextNode.costSoFar = newCost;

                        for (idx = 0; idx < frontier.length; idx++)
                        {
                            if (frontier[idx].costSoFar > newCost)
                            {
                                frontier.splice(idx, 0, nextNode);
                                break;
                            }
                        }
                        if (idx === frontier.length)
                        {
                            frontier.push(nextNode);
                        }

                        nextNode.cameFrom = currentNode;
                    }
                }
            }
        }

        currentNode = goalNode;

        while (currentNode.costSoFar !== 0)
        {
            reversePath.push(currentNode.location);
            currentNode = currentNode.cameFrom;
        }
        // Reverse the list, so index 0 is the start
        while (reversePath.length)
        {
            path.push(reversePath.pop());
        }

        return path;
    };
};
