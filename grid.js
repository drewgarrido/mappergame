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
    this.edges = [];
    this.costSoFar = Number.MAX_VALUE;
    this.connected = true;
    this.cameFrom;
};

var Grid = function(widthp, heightp)
{
    this.nodes = [];
    this.width = widthp;
    this.height = heightp;
    this.diagonalsEnabled = true;

    // For searching
    this.startNode;
    this.frontier;    // Priority queue
    this.goalNode;
    this.path = [];
    this.pathFound = false;
    this.intervalId;

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
                node.edges = [];
                if (x > 0)
                {
                    node.edges.push({node:this.nodes[x-1][y],cost:1});
                }
                if (x < this.width - 1)
                {
                    node.edges.push({node:this.nodes[x+1][y],cost:1});
                }
                if (y > 0)
                {
                    node.edges.push({node:this.nodes[x][y-1],cost:1});
                }
                if (y < this.height - 1)
                {
                    node.edges.push({node:this.nodes[x][y+1],cost:1});
                }

                if (this.diagonalsEnabled)
                {
                    if (x > 0)
                    {
                        if (y > 0)
                        {
                            node.edges.push({node:this.nodes[x-1][y-1],cost:1.4});
                        }
                        if (y < this.height - 1)
                        {
                            node.edges.push({node:this.nodes[x-1][y+1],cost:1.4});
                        }
                    }
                    if (x < this.width - 1)
                    {
                        if (y > 0)
                        {
                            node.edges.push({node:this.nodes[x+1][y-1],cost:1.4});
                        }
                        if (y < this.height - 1)
                        {
                            node.edges.push({node:this.nodes[x+1][y+1],cost:1.4});
                        }
                    }
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
        this.startNode = this.nodes[startPoint.x][startPoint.y];
        this.frontier = [this.startNode];    // Priority queue
        this.newCost = 0;
        this.reversePath = [];
        this.path.length = 0;
        this.pathFound = false;
        this.goalNode = undefined;
        this.goalPoints = goalPoints;

        this.resetGridPath();

        this.startNode.costSoFar = 0;

        this.intervalId = setInterval(this.iterateDijkstraToClosestGoal.bind(this), 10);
    };

    this.iterateDijkstraToClosestGoal = function()
    {
        var idx, edgeIdx;
        var newCost, nextNode, currentNode;
        var iterCount = 0;
        var frontierInitialSize = this.frontier.length;

        if (this.frontier.length > 0 && this.goalNode === undefined)
        {
            for (iterCount = 0; iterCount < frontierInitialSize; iterCount++)
            {
                currentNode = this.frontier.shift();

                for (idx = 0; idx < this.goalPoints.length; idx++)
                {
                    if (currentNode.location.isEqual(this.goalPoints[idx]))
                    {
                        this.goalNode = currentNode;
                        break;
                    }
                }

                if (this.goalNode === undefined)
                {
                    for (edgeIdx = 0;
                         edgeIdx < currentNode.edges.length;
                         edgeIdx++)
                    {
                        nextNode = currentNode.edges[edgeIdx].node;
                        newCost = currentNode.costSoFar + currentNode.edges[edgeIdx].cost;

                        if (nextNode.connected &&
                            newCost < nextNode.costSoFar)
                        {
                            nextNode.costSoFar = newCost;

                            for (idx = 0; idx < this.frontier.length; idx++)
                            {
                                if (this.frontier[idx].costSoFar > newCost)
                                {
                                    this.frontier.splice(idx, 0, nextNode);
                                    break;
                                }
                            }
                            if (idx === this.frontier.length)
                            {
                                this.frontier.push(nextNode);
                            }

                            nextNode.cameFrom = currentNode;
                        }
                    }
                }
                else
                {
                    this.finishDijkstraToClosestGoal();
                    break;
                }
            }
        }
        else
        {
            clearInterval(this.intervalId);
        }
    };

    this.finishDijkstraToClosestGoal = function()
    {
        var reversePath = [];
        var currentNode = this.goalNode;

        while (currentNode.costSoFar !== 0)
        {
            reversePath.push(currentNode.location);
            currentNode = currentNode.cameFrom;
        }
        // Reverse the list, so index 0 is the start
        while (reversePath.length)
        {
            this.path.push(reversePath.pop());
        }

        this.pathFound = true;
        clearInterval(this.intervalId);
    };

    this.render = function(ctx)
    {
        var idx, idy, dataIdx;

        var imgData = ctx.getImageData(0,0,this.width,this.height);

        for (idx = 0; idx < this.width; idx++)
        {
            for (idy = 0; idy < this.height; idy++)
            {
                if (this.nodes[idx][idy].costSoFar !== Number.MAX_VALUE)
                {
                    dataIdx = (idx + this.width * idy) * 4;
                    imgData.data[dataIdx] = 0;          // Red
                    imgData.data[dataIdx+1] = 255;      // Green
                    imgData.data[dataIdx+2] = 255;      // Blue
                    imgData.data[dataIdx+3] = 255;      // Alpha
                }
            }
        }

        ctx.putImageData(imgData,0,0);
    };
};
