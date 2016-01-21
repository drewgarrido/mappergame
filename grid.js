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

var Vector2D = function(x_pa, y_pa)
{
    this.x = x_pa;
    this.y = y_pa;

    this.isEqual = function(other_v)
    {
        var result = false;
        if (this.x === other_v.x && this.y === other_v.y)
        {
            result = true;
        }
        return result;
    };

    this.round = function()
    {
        return (new Vector2D(Math.round(this.x), Math.round(this.y)));
    }
};

var Node = function(x_pa, y_pa)
{
    this.location = new Vector2D(x_pa, y_pa);
    this.neighbors = [];
    this.cost_so_far = Number.MAX_VALUE;
    this.cost_to = 1;
    this.connected = true;
    this.came_from;
};

var Grid = function(width_pa, height_pa)
{
    this.nodes = [];
    this.width = width_pa;
    this.height = height_pa;

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
                this.nodes[x][y].came_from = undefined;
                this.nodes[x][y].cost_so_far = Number.MAX_VALUE;
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
                this.nodes[x][y].came_from = undefined;
                this.nodes[x][y].cost_so_far = Number.MAX_VALUE;
            }
        }
    };

    this.updateGridConnections = function(walls)
    {
        var i, start_x, start_y, end_x, end_y;

        for (i = 0; i < walls.length; i++)
        {
            start_x = Math.max(0, walls[i].x - 32);
            start_y = Math.max(0, walls[i].y - 32);
            end_x = Math.min(this.width, walls[i].x + 32);
            end_y = Math.min(this.height, walls[i].y + 32);

            for (var x = start_x; x < end_x; x++)
            {
                for (var y = start_y; y < end_y; y++)
                {
                    this.nodes[x][y].connected = false;
                }
            }
        }
    };


    this.dijkstra_to_closest_goal = function(start_point, goal_points)
    {
        var start_node = this.nodes[start_point.x][start_point.y];
        var frontier = [start_node];    // Priority queue
        var current_node, next_node, goal_node;
        var new_cost = 0;
        var reverse_path = [];
        var path = [];
        var idx, neigh_idx;

        this.resetGridPath();

        start_node.cost_so_far = 0;

        while (frontier.length > 0 && goal_node === undefined)
        {
            current_node = frontier.shift();

            for (idx = 0; idx < goal_points.length; idx++)
            {
                if (current_node.location.isEqual(goal_points[idx]))
                {
                    goal_node = current_node;
                    break;
                }
            }

            if (goal_node === undefined)
            {
                for (neigh_idx = 0;
                     neigh_idx < current_node.neighbors.length;
                     neigh_idx++)
                {
                    next_node = current_node.neighbors[neigh_idx];
                    new_cost = current_node.cost_so_far + next_node.cost_to;

                    if (next_node.connected &&
                        new_cost < next_node.cost_so_far)
                    {
                        next_node.cost_so_far = new_cost;

                        for (idx = 0; idx < frontier.length; idx++)
                        {
                            if (frontier[idx].cost_so_far > new_cost)
                            {
                                frontier.splice(idx, 0, next_node);
                                break;
                            }
                        }
                        if (idx === frontier.length)
                        {
                            frontier.push(next_node);
                        }

                        next_node.came_from = current_node;
                    }
                }
            }
        }

        current_node = goal_node;

        while (current_node.cost_so_far !== 0)
        {
            reverse_path.push(current_node.location);
            current_node = current_node.came_from;
        }
        // Reverse the list, so index 0 is the start
        while (reverse_path.length)
        {
            path.push(reverse_path.pop());
        }

        return path;
    };
};
