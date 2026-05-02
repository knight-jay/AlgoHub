-- ============================================
-- AlgoHub 算法知识库 数据库初始化脚本
-- ============================================

DROP TABLE IF EXISTS `algorithms`;
DROP TABLE IF EXISTS `algorithm_categories`;

-- 算法分类表（树形结构）
CREATE TABLE `algorithm_categories` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '分类ID',
    `name` VARCHAR(50) NOT NULL COMMENT '分类名称',
    `parent_id` BIGINT DEFAULT NULL COMMENT '父分类ID，NULL表示顶级分类',
    `sort_order` INT DEFAULT 0 COMMENT '排序序号',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    FOREIGN KEY (`parent_id`) REFERENCES `algorithm_categories`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='算法分类表';

-- 算法详情表
CREATE TABLE `algorithms` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '算法ID',
    `title` VARCHAR(100) NOT NULL COMMENT '算法名称',
    `description` TEXT COMMENT '算法简介',
    `usage_intro` TEXT COMMENT '使用场景/用法说明',
    `cpp_template` TEXT COMMENT 'C++模板代码',
    `category_id` BIGINT DEFAULT NULL COMMENT '所属分类ID',
    `difficulty` VARCHAR(20) DEFAULT 'medium' COMMENT '难度：easy/medium/hard',
    `tags` VARCHAR(255) DEFAULT NULL COMMENT '标签，逗号分隔',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    FOREIGN KEY (`category_id`) REFERENCES `algorithm_categories`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='算法详情表';

-- ============================================
-- 插入分类数据
-- ============================================
INSERT INTO `algorithm_categories` (`id`, `name`, `parent_id`, `sort_order`) VALUES
(1, '基础算法', NULL, 1),
(2, '搜索', NULL, 2),
(3, '数据结构', NULL, 3),
(4, '图论', NULL, 4),
(5, '动态规划', NULL, 5),
(6, '字符串', NULL, 6),
(7, '数学', NULL, 7),
(8, '思维技巧', NULL, 8);

INSERT INTO `algorithm_categories` (`name`, `parent_id`, `sort_order`) VALUES
('排序', 1, 1),
('二分查找/三分查找', 1, 2),
('贪心', 1, 3),
('分治', 1, 4),
('双指针/滑动窗口', 1, 5),
('前缀和与差分', 1, 6),
('离散化', 1, 7),
('位运算基础', 1, 8),
('DFS及剪枝', 2, 1),
('BFS', 2, 2),
('双向BFS', 2, 3),
('回溯', 2, 4),
('并查集', 3, 1),
('哈希表/滚动哈希', 3, 2),
('单调栈/单调队列', 3, 3),
('线段树', 3, 4),
('树状数组', 3, 5),
('最近公共祖先(LCA)', 3, 6),
('字典树(Trie)', 3, 7),
('AC自动机', 3, 8),
('分块', 3, 9),
('莫队算法', 3, 10),
('最小生成树', 4, 1),
('最短路', 4, 2),
('拓扑排序', 4, 3),
('强连通分量(Tarjan)', 4, 4),
('割点/割边', 4, 5),
('二分图判定', 4, 6),
('二分图最大匹配', 4, 7),
('欧拉路径/欧拉回路', 4, 8),
('差分约束系统', 4, 9),
('背包DP', 5, 1),
('区间DP', 5, 2),
('树形DP', 5, 3),
('数位DP', 5, 4),
('状压DP', 5, 5),
('计数DP', 5, 6),
('概率DP', 5, 7),
('KMP算法', 6, 1),
('Manacher算法', 6, 2),
('素数筛', 7, 1),
('欧拉函数', 7, 2),
('扩展欧几里得', 7, 3),
('中国剩余定理', 7, 4),
('快速幂', 7, 5),
('组合数取模', 7, 6),
('容斥原理', 7, 7),
('博弈论', 7, 8),
('矩阵快速幂', 7, 9),
('高斯消元', 7, 10),
('线性基', 7, 11),
('模拟', 8, 1),
('构造', 8, 2),
('逆向思维', 8, 3);

-- ============================================
-- 插入算法数据
-- ============================================

-- 排序
INSERT INTO `algorithms` (`title`, `description`, `usage_intro`, `cpp_template`, `category_id`, `difficulty`, `tags`) VALUES
('快速排序', '快速排序是一种基于分治思想的高效排序算法。通过选取一个基准元素(pivot)，将数组划分为小于基准和大于基准的两部分，然后递归地对两部分进行排序。平均时间复杂度O(n log n)，最坏O(n²)，但实际应用中通常是最快的通用排序算法。', '适用于大规模数据排序，是C++ STL中std::sort的内部实现基础。当需要稳定排序时可考虑归并排序。', '#include <vector>\nusing namespace std;\n\nint partition(vector<int>& arr, int low, int high) {\n    int pivot = arr[high];\n    int i = low - 1;\n    for (int j = low; j < high; j++) {\n        if (arr[j] <= pivot) {\n            i++;\n            swap(arr[i], arr[j]);\n        }\n    }\n    swap(arr[i + 1], arr[high]);\n    return i + 1;\n}\n\nvoid quickSort(vector<int>& arr, int low, int high) {\n    if (low < high) {\n        int pi = partition(arr, low, high);\n        quickSort(arr, low, pi - 1);\n        quickSort(arr, pi + 1, high);\n    }\n}', (SELECT id FROM algorithm_categories WHERE name='排序'), 'medium', '排序,分治'),

('归并排序', '归并排序是稳定的分治排序算法。将数组递归地分成两半，分别排序后再合并。时间复杂度始终为O(n log n)，需要O(n)的额外空间。', '适用于需要稳定排序的场景，以及链表排序（归并排序在链表上表现优异，不需要额外空间）。', '#include <vector>\nusing namespace std;\n\nvoid merge(vector<int>& arr, int l, int m, int r) {\n    int n1 = m - l + 1, n2 = r - m;\n    vector<int> L(n1), R(n2);\n    for (int i = 0; i < n1; i++) L[i] = arr[l + i];\n    for (int i = 0; i < n2; i++) R[i] = arr[m + 1 + i];\n    int i = 0, j = 0, k = l;\n    while (i < n1 && j < n2) {\n        if (L[i] <= R[j]) arr[k++] = L[i++];\n        else arr[k++] = R[j++];\n    }\n    while (i < n1) arr[k++] = L[i++];\n    while (j < n2) arr[k++] = R[j++];\n}\n\nvoid mergeSort(vector<int>& arr, int l, int r) {\n    if (l < r) {\n        int m = l + (r - l) / 2;\n        mergeSort(arr, l, m);\n        mergeSort(arr, m + 1, r);\n        merge(arr, l, m, r);\n    }\n}', (SELECT id FROM algorithm_categories WHERE name='排序'), 'medium', '排序,分治,稳定'),

('堆排序', '堆排序利用二叉堆（大顶堆）数据结构进行排序。先建堆(O(n))，然后反复取出堆顶元素放到数组末尾并调整堆，每次调整O(log n)。总时间复杂度O(n log n)，空间复杂度O(1)。', '适用于需要原地排序且对稳定性无要求的场景，常用于实现优先队列。', '#include <vector>\nusing namespace std;\n\nvoid heapify(vector<int>& arr, int n, int i) {\n    int largest = i, l = 2 * i + 1, r = 2 * i + 2;\n    if (l < n && arr[l] > arr[largest]) largest = l;\n    if (r < n && arr[r] > arr[largest]) largest = r;\n    if (largest != i) {\n        swap(arr[i], arr[largest]);\n        heapify(arr, n, largest);\n    }\n}\n\nvoid heapSort(vector<int>& arr) {\n    int n = arr.size();\n    for (int i = n / 2 - 1; i >= 0; i--) heapify(arr, n, i);\n    for (int i = n - 1; i > 0; i--) {\n        swap(arr[0], arr[i]);\n        heapify(arr, i, 0);\n    }\n}', (SELECT id FROM algorithm_categories WHERE name='排序'), 'medium', '排序,堆'),

('计数排序', '计数排序是非比较排序算法，适用于数据范围较小的整数排序。统计每个值出现的次数，然后按顺序输出。时间复杂度O(n+k)，k为数据范围。', '适用于整数排序且数据范围较小（如年龄、成绩排名等），不适用于浮点数或范围很大的数据。', '#include <vector>\n#include <algorithm>\nusing namespace std;\n\nvoid countingSort(vector<int>& arr) {\n    if (arr.empty()) return;\n    int mx = *max_element(arr.begin(), arr.end());\n    int mn = *min_element(arr.begin(), arr.end());\n    int range = mx - mn + 1;\n    vector<int> count(range), output(arr.size());\n    for (int x : arr) count[x - mn]++;\n    for (int i = 1; i < range; i++) count[i] += count[i - 1];\n    for (int i = arr.size() - 1; i >= 0; i--) {\n        output[count[arr[i] - mn] - 1] = arr[i];\n        count[arr[i] - mn]--;\n    }\n    arr = output;\n}', (SELECT id FROM algorithm_categories WHERE name='排序'), 'easy', '排序,非比较排序');

-- 二分查找
INSERT INTO `algorithms` (`title`, `description`, `usage_intro`, `cpp_template`, `category_id`, `difficulty`, `tags`) VALUES
('二分查找', '在有序序列中通过每次将搜索范围减半来查找目标值。时间复杂度O(log n)。核心在于正确处理边界条件和循环不变量。', '最基础的高效搜索算法，适用于有序数组中的查找。变体包括查找第一个/最后一个等于目标值的位置、查找插入位置等。', 'int binarySearch(vector<int>& arr, int target) {\n    int l = 0, r = arr.size() - 1;\n    while (l <= r) {\n        int mid = l + (r - l) / 2;\n        if (arr[mid] == target) return mid;\n        else if (arr[mid] < target) l = mid + 1;\n        else r = mid - 1;\n    }\n    return -1;\n}', (SELECT id FROM algorithm_categories WHERE name='二分查找/三分查找'), 'easy', '搜索,二分'),

('三分查找', '三分查找用于在单峰函数中寻找极值点。每次将区间分成三段，根据两个分点的函数值比较来舍弃1/3的区间。', '适用于凸函数/凹函数求极值，以及需要找到峰值的问题（如数组中寻找峰值元素）。', 'double ternarySearch(double l, double r, function<double(double)> f) {\n    const double EPS = 1e-9;\n    while (r - l > EPS) {\n        double m1 = l + (r - l) / 3;\n        double m2 = r - (r - l) / 3;\n        if (f(m1) < f(m2)) l = m1;\n        else r = m2;\n    }\n    return f(l);\n}', (SELECT id FROM algorithm_categories WHERE name='二分查找/三分查找'), 'medium', '搜索,三分');

-- DFS
INSERT INTO `algorithms` (`title`, `description`, `usage_intro`, `cpp_template`, `category_id`, `difficulty`, `tags`) VALUES
('DFS及剪枝', '深度优先搜索(DFS)从起点出发沿着一条路径深入到底，然后回溯探索其他分支。剪枝是在搜索过程中提前排除不可能产生最优解的分支，大幅提升效率。', '适用于全排列、组合、子集、图的连通性判断、路径搜索等问题。剪枝常用于竞赛中的搜索优化。', '#include <vector>\nusing namespace std;\n\nvector<vector<int>> adj;\nvector<bool> visited;\n\nvoid dfs(int u) {\n    visited[u] = true;\n    for (int v : adj[u]) {\n        if (!visited[v]) dfs(v);\n    }\n}\n\n// 回溯框架（以全排列为例）\nvoid backtrack(vector<int>& nums, vector<bool>& used,\n               vector<int>& cur, vector<vector<int>>& res) {\n    if (cur.size() == nums.size()) {\n        res.push_back(cur);\n        return;\n    }\n    for (int i = 0; i < nums.size(); i++) {\n        if (used[i]) continue;\n        // 剪枝：跳过重复元素\n        if (i > 0 && nums[i] == nums[i-1] && !used[i-1]) continue;\n        used[i] = true;\n        cur.push_back(nums[i]);\n        backtrack(nums, used, cur, res);\n        cur.pop_back();\n        used[i] = false;\n    }\n}', (SELECT id FROM algorithm_categories WHERE name='DFS及剪枝'), 'medium', '搜索,DFS,剪枝,回溯');

-- BFS
INSERT INTO `algorithms` (`title`, `description`, `usage_intro`, `cpp_template`, `category_id`, `difficulty`, `tags`) VALUES
('BFS', '广度优先搜索(BFS)逐层遍历，从起点开始先访问所有相邻节点，再访问相邻节点的相邻节点。使用队列实现，保证找到的路径最短（边权为1）。', '适用于最短路径（无权图）、层序遍历、连通分量标记、拓扑排序、状态空间搜索等。', '#include <queue>\n#include <vector>\nusing namespace std;\n\nvoid bfs(int start, vector<vector<int>>& adj) {\n    int n = adj.size();\n    vector<bool> visited(n, false);\n    vector<int> dist(n, -1);\n    queue<int> q;\n    q.push(start);\n    visited[start] = true;\n    dist[start] = 0;\n    while (!q.empty()) {\n        int u = q.front(); q.pop();\n        for (int v : adj[u]) {\n            if (!visited[v]) {\n                visited[v] = true;\n                dist[v] = dist[u] + 1;\n                q.push(v);\n            }\n        }\n    }\n}', (SELECT id FROM algorithm_categories WHERE name='BFS'), 'medium', '搜索,BFS'),

('双向BFS', '双向BFS从起点和终点同时进行BFS，当两个搜索相遇时即找到最短路径。相比单向BFS可将搜索空间从O(b^d)降至O(b^(d/2))。', '适用于已知起点和终点的最短路径问题（如单词接龙、八数码问题的优化），当搜索空间很大但深度较浅时效果显著。', '#include <queue>\n#include <unordered_set>\nusing namespace std;\n\nint bidirectionalBFS(string start, string end, auto getNext) {\n    unordered_set<string> s1{start}, s2{end};\n    unordered_set<string> visited{start, end};\n    int step = 0;\n    while (!s1.empty() && !s2.empty()) {\n        if (s1.size() > s2.size()) swap(s1, s2);\n        unordered_set<string> next;\n        for (auto& cur : s1) {\n            for (auto& nxt : getNext(cur)) {\n                if (s2.count(nxt)) return step + 1;\n                if (!visited.count(nxt)) {\n                    visited.insert(nxt);\n                    next.insert(nxt);\n                }\n            }\n        }\n        s1 = next;\n        step++;\n    }\n    return -1;\n}', (SELECT id FROM algorithm_categories WHERE name='双向BFS'), 'hard', '搜索,BFS,双向BFS');

-- 并查集
INSERT INTO `algorithms` (`title`, `description`, `usage_intro`, `cpp_template`, `category_id`, `difficulty`, `tags`) VALUES
('并查集', '并查集(Disjoint Set Union)用于管理元素分组的数据结构。支持两个基本操作：查找(Find)元素所属集合，以及合并(Union)两个集合。通过路径压缩和按秩合并优化后，均摊时间复杂度接近O(1)。', '广泛应用于连通性问题（如Kruskal最小生成树、图的连通分量）、动态连通性判断、等价关系维护等。', '#include <vector>\nusing namespace std;\n\nclass DSU {\n    vector<int> parent, rank;\npublic:\n    DSU(int n) {\n        parent.resize(n);\n        rank.resize(n, 0);\n        for (int i = 0; i < n; i++) parent[i] = i;\n    }\n    int find(int x) {\n        if (parent[x] != x)\n            parent[x] = find(parent[x]); // 路径压缩\n        return parent[x];\n    }\n    void unite(int x, int y) {\n        int px = find(x), py = find(y);\n        if (px == py) return;\n        if (rank[px] < rank[py]) parent[px] = py;\n        else if (rank[px] > rank[py]) parent[py] = px;\n        else { parent[py] = px; rank[px]++; }\n    }\n    bool same(int x, int y) { return find(x) == find(y); }\n};', (SELECT id FROM algorithm_categories WHERE name='并查集'), 'medium', '数据结构,并查集');

-- 线段树
INSERT INTO `algorithms` (`title`, `description`, `usage_intro`, `cpp_template`, `category_id`, `difficulty`, `tags`) VALUES
('线段树', '线段树是一种二叉树结构，用于高效处理区间查询和区间更新。每个节点代表一个区间，支持O(log n)的区间修改和查询操作。', '适用于需要频繁进行区间操作的问题，如区间求和、区间最值、区间加法。可配合Lazy标记处理区间更新。', '#include <vector>\nusing namespace std;\nusing ll = long long;\n\nclass SegTree {\n    vector<ll> tree, lazy;\n    int n;\n    void build(int node, int l, int r, vector<ll>& arr) {\n        if (l == r) { tree[node] = arr[l]; return; }\n        int mid = (l + r) / 2;\n        build(node * 2, l, mid, arr);\n        build(node * 2 + 1, mid + 1, r, arr);\n        tree[node] = tree[node * 2] + tree[node * 2 + 1];\n    }\n    void push(int node, int l, int r) {\n        if (lazy[node]) {\n            tree[node] += lazy[node] * (r - l + 1);\n            if (l != r) {\n                lazy[node * 2] += lazy[node];\n                lazy[node * 2 + 1] += lazy[node];\n            }\n            lazy[node] = 0;\n        }\n    }\n    void update(int node, int l, int r, int ql, int qr, ll val) {\n        push(node, l, r);\n        if (ql > r || qr < l) return;\n        if (ql <= l && r <= qr) { lazy[node] += val; push(node, l, r); return; }\n        int mid = (l + r) / 2;\n        update(node * 2, l, mid, ql, qr, val);\n        update(node * 2 + 1, mid + 1, r, ql, qr, val);\n        tree[node] = tree[node * 2] + tree[node * 2 + 1];\n    }\n    ll query(int node, int l, int r, int ql, int qr) {\n        push(node, l, r);\n        if (ql > r || qr < l) return 0;\n        if (ql <= l && r <= qr) return tree[node];\n        int mid = (l + r) / 2;\n        return query(node * 2, l, mid, ql, qr)\n             + query(node * 2 + 1, mid + 1, r, ql, qr);\n    }\npublic:\n    SegTree(vector<ll>& arr) {\n        n = arr.size();\n        tree.resize(4 * n);\n        lazy.resize(4 * n);\n        build(1, 0, n - 1, arr);\n    }\n    void update(int l, int r, ll val) { update(1, 0, n - 1, l, r, val); }\n    ll query(int l, int r) { return query(1, 0, n - 1, l, r); }\n};', (SELECT id FROM algorithm_categories WHERE name='线段树'), 'hard', '数据结构,线段树,区间操作');

-- 树状数组
INSERT INTO `algorithms` (`title`, `description`, `usage_intro`, `cpp_template`, `category_id`, `difficulty`, `tags`) VALUES
('树状数组', '树状数组(BIT/Fenwick Tree)是一种空间效率高的数据结构，用于维护前缀信息。支持O(log n)的单点更新和区间查询，实现简洁高效。', '适用于前缀和/前缀最值维护，如经典求逆序对问题。相比线段树实现更简单，常数更小，但功能较少。', '#include <vector>\nusing namespace std;\n\nclass BIT {\n    vector<int> tree;\n    int n;\npublic:\n    BIT(int n) : n(n) { tree.resize(n + 1); }\n    void add(int idx, int val) {\n        for (; idx <= n; idx += idx & -idx)\n            tree[idx] += val;\n    }\n    int sum(int idx) {\n        int s = 0;\n        for (; idx > 0; idx -= idx & -idx)\n            s += tree[idx];\n        return s;\n    }\n    int rangeSum(int l, int r) {\n        return sum(r) - sum(l - 1);\n    }\n};', (SELECT id FROM algorithm_categories WHERE name='树状数组'), 'medium', '数据结构,树状数组');

-- 最小生成树
INSERT INTO `algorithms` (`title`, `description`, `usage_intro`, `cpp_template`, `category_id`, `difficulty`, `tags`) VALUES
('Kruskal最小生成树', 'Kruskal算法按边权从小到大排序所有边，使用并查集判断是否形成环，贪心地选择不形成环的边加入生成树。时间复杂度O(E log E)。', '适用于稀疏图的最小生成树问题。搭配并查集实现高效判断连通性。边数较多的稠密图推荐使用Prim算法。', '#include <vector>\n#include <algorithm>\nusing namespace std;\n\nstruct Edge { int u, v, w; };\n\nint kruskal(int n, vector<Edge>& edges) {\n    sort(edges.begin(), edges.end(),\n         [](Edge& a, Edge& b) { return a.w < b.w; });\n    DSU dsu(n);\n    int mstWeight = 0, cnt = 0;\n    for (auto& e : edges) {\n        if (!dsu.same(e.u, e.v)) {\n            dsu.unite(e.u, e.v);\n            mstWeight += e.w;\n            cnt++;\n            if (cnt == n - 1) break;\n        }\n    }\n    return cnt == n - 1 ? mstWeight : -1; // -1表示不连通\n}', (SELECT id FROM algorithm_categories WHERE name='最小生成树'), 'medium', '图论,MST,Kruskal');

-- 最短路
INSERT INTO `algorithms` (`title`, `description`, `usage_intro`, `cpp_template`, `category_id`, `difficulty`, `tags`) VALUES
('Dijkstra最短路', 'Dijkstra算法求解单源最短路径，适用于非负权图。使用优先队列优化的时间复杂度为O((V+E) log V)。核心是贪心思想：每次选择当前距离最小的未处理节点。', '最常用的最短路算法，适用于大部分图的单源最短路径问题。注意不能处理负权边（负权边应用Bellman-Ford或SPFA）。', '#include <queue>\n#include <vector>\nusing namespace std;\nusing pii = pair<int, int>;\n\nvector<int> dijkstra(int n, vector<vector<pii>>& adj, int start) {\n    vector<int> dist(n, INT_MAX);\n    priority_queue<pii, vector<pii>, greater<pii>> pq;\n    dist[start] = 0;\n    pq.push({0, start});\n    while (!pq.empty()) {\n        auto [d, u] = pq.top(); pq.pop();\n        if (d > dist[u]) continue;\n        for (auto [v, w] : adj[u]) {\n            if (dist[v] > dist[u] + w) {\n                dist[v] = dist[u] + w;\n                pq.push({dist[v], v});\n            }\n        }\n    }\n    return dist;\n}', (SELECT id FROM algorithm_categories WHERE name='最短路'), 'medium', '图论,最短路,Dijkstra');

-- 背包DP
INSERT INTO `algorithms` (`title`, `description`, `usage_intro`, `cpp_template`, `category_id`, `difficulty`, `tags`) VALUES
('0/1背包', '0/1背包问题：有N件物品和一个容量为W的背包，每件物品只能选0次或1次，求能装入背包的最大价值。使用二维DP或优化为一维DP，时间复杂度O(NW)。', '最经典的DP问题，广泛出现在各类算法竞赛和面试中。掌握0/1背包后，完全背包、多重背包等变体都可类似推导。', '#include <vector>\nusing namespace std;\n\nint zeroOneKnapsack(vector<int>& weight, vector<int>& value, int W) {\n    vector<int> dp(W + 1, 0);\n    for (int i = 0; i < weight.size(); i++) {\n        for (int w = W; w >= weight[i]; w--) {  // 倒序遍历保证0/1\n            dp[w] = max(dp[w], dp[w - weight[i]] + value[i]);\n        }\n    }\n    return dp[W];\n}', (SELECT id FROM algorithm_categories WHERE name='背包DP'), 'medium', 'DP,背包'),

('完全背包', '完全背包问题：每件物品可以选无限次，其他同0/1背包。只需将内层循环改为正序遍历即可。时间复杂度O(NW)。', '适用于物品可重复选取的场景，如硬币找零问题（每种硬币无限枚）。', '#include <vector>\nusing namespace std;\n\nint completeKnapsack(vector<int>& weight, vector<int>& value, int W) {\n    vector<int> dp(W + 1, 0);\n    for (int i = 0; i < weight.size(); i++) {\n        for (int w = weight[i]; w <= W; w++) {  // 正序遍历实现完全背包\n            dp[w] = max(dp[w], dp[w - weight[i]] + value[i]);\n        }\n    }\n    return dp[W];\n}', (SELECT id FROM algorithm_categories WHERE name='背包DP'), 'medium', 'DP,背包');

-- KMP
INSERT INTO `algorithms` (`title`, `description`, `usage_intro`, `cpp_template`, `category_id`, `difficulty`, `tags`) VALUES
('KMP算法', 'KMP(Knuth-Morris-Pratt)字符串匹配算法通过预处理模式串的next数组（前缀函数），在匹配失败时利用已匹配的信息跳过不必要的比较。时间复杂度O(n+m)。', '高效的单模式串匹配算法，广泛应用于文本搜索、DNA序列匹配等场景。相比暴力匹配O(nm)，KMP在线性时间内完成。', '#include <string>\n#include <vector>\nusing namespace std;\n\nvector<int> computeLPS(string& pat) {\n    int m = pat.size();\n    vector<int> lps(m, 0);\n    for (int i = 1, len = 0; i < m; ) {\n        if (pat[i] == pat[len]) lps[i++] = ++len;\n        else if (len) len = lps[len - 1];\n        else lps[i++] = 0;\n    }\n    return lps;\n}\n\nvector<int> kmp(string& txt, string& pat) {\n    vector<int> lps = computeLPS(pat), res;\n    int n = txt.size(), m = pat.size();\n    for (int i = 0, j = 0; i < n; ) {\n        if (txt[i] == pat[j]) { i++; j++; }\n        if (j == m) { res.push_back(i - j); j = lps[j - 1]; }\n        else if (i < n && txt[i] != pat[j]) {\n            j ? j = lps[j - 1] : i++;\n        }\n    }\n    return res; // 返回所有匹配起始位置\n}', (SELECT id FROM algorithm_categories WHERE name='KMP算法'), 'medium', '字符串,KMP,匹配');

-- 快速幂
INSERT INTO `algorithms` (`title`, `description`, `usage_intro`, `cpp_template`, `category_id`, `difficulty`, `tags`) VALUES
('快速幂', '快速幂（二分幂）利用指数的二进制分解，将幂运算从O(n)优化到O(log n)。核心思想：a^n = a^(n/2) × a^(n/2)（n为偶数）或 a × a^(n/2) × a^(n/2)（n为奇数）。', '广泛用于大数幂运算取模，是很多数学算法的基础。常配合模运算解决指数增长问题。', 'using ll = long long;\n\nll quickPow(ll a, ll b, ll mod) {\n    ll res = 1;\n    a %= mod;\n    while (b) {\n        if (b & 1) res = (res * a) % mod;\n        a = (a * a) % mod;\n        b >>= 1;\n    }\n    return res;\n}', (SELECT id FROM algorithm_categories WHERE name='快速幂'), 'easy', '数学,快速幂,位运算');

-- 拓扑排序
INSERT INTO `algorithms` (`title`, `description`, `usage_intro`, `cpp_template`, `category_id`, `difficulty`, `tags`) VALUES
('拓扑排序', '拓扑排序将有向无环图(DAG)的所有顶点排成一个线性序列，使得对任意边(u,v)，u在序列中出现在v之前。使用Kahn算法（BFS+入度）或DFS实现，时间复杂度O(V+E)。', '用于任务调度（先修课问题）、依赖解析（如Makefile构建顺序）、编译器中的指令排序等。', '#include <vector>\n#include <queue>\nusing namespace std;\n\nvector<int> topologicalSort(int n, vector<vector<int>>& adj) {\n    vector<int> indegree(n, 0);\n    for (int u = 0; u < n; u++)\n        for (int v : adj[u]) indegree[v]++;\n    queue<int> q;\n    for (int i = 0; i < n; i++)\n        if (indegree[i] == 0) q.push(i);\n    vector<int> order;\n    while (!q.empty()) {\n        int u = q.front(); q.pop();\n        order.push_back(u);\n        for (int v : adj[u])\n            if (--indegree[v] == 0) q.push(v);\n    }\n    if (order.size() != n) return {}; // 存在环\n    return order;\n}', (SELECT id FROM algorithm_categories WHERE name='拓扑排序'), 'medium', '图论,拓扑排序,DAG');

-- 素数筛
INSERT INTO `algorithms` (`title`, `description`, `usage_intro`, `cpp_template`, `category_id`, `difficulty`, `tags`) VALUES
('欧拉筛（线性筛）', '欧拉筛（线性筛）在O(n)时间内筛出1到n的所有素数。核心原理：每个合数只被其最小质因子筛掉一次，从而保证线性时间复杂度。', '素数筛是高阶数论算法的基础。相比埃氏筛O(n log log n)，欧拉筛在线性时间完成，同时可顺便求出每个数的最小质因子和欧拉函数值。', '#include <vector>\nusing namespace std;\n\nvector<int> eulerSieve(int n) {\n    vector<int> primes;\n    vector<bool> isPrime(n + 1, true);\n    isPrime[0] = isPrime[1] = false;\n    for (int i = 2; i <= n; i++) {\n        if (isPrime[i]) primes.push_back(i);\n        for (int p : primes) {\n            if (i * p > n) break;\n            isPrime[i * p] = false;\n            if (i % p == 0) break; // 保证每个数只被最小质因子筛掉\n        }\n    }\n    return primes;\n}', (SELECT id FROM algorithm_categories WHERE name='素数筛'), 'medium', '数学,素数,线性筛');

-- 动态规划-区间DP
INSERT INTO `algorithms` (`title`, `description`, `usage_intro`, `cpp_template`, `category_id`, `difficulty`, `tags`) VALUES
('区间DP', '区间DP以区间长度作为DP的阶段，从小到大枚举区间长度进行状态转移。典型问题包括石子合并、矩阵链乘、回文串相关等。', '适用于问题可以分解为子区间合并的场景。核心是找到区间划分点k，将[i,j]分解为[i,k]和[k+1,j]。', '#include <vector>\n#include <algorithm>\nusing namespace std;\n\n// 石子合并：最少合并代价\nint stoneMerge(vector<int>& stones) {\n    int n = stones.size();\n    vector<int> prefix(n + 1, 0);\n    for (int i = 0; i < n; i++) prefix[i + 1] = prefix[i] + stones[i];\n    vector<vector<int>> dp(n, vector<int>(n, 0));\n    for (int len = 2; len <= n; len++) {\n        for (int i = 0; i + len - 1 < n; i++) {\n            int j = i + len - 1;\n            dp[i][j] = INT_MAX;\n            for (int k = i; k < j; k++) {\n                dp[i][j] = min(dp[i][j],\n                    dp[i][k] + dp[k+1][j] + prefix[j+1] - prefix[i]);\n            }\n        }\n    }\n    return dp[0][n - 1];\n}', (SELECT id FROM algorithm_categories WHERE name='区间DP'), 'medium', 'DP,区间DP'),
('字典树(Trie)', 'Trie（前缀树）是一种多叉树结构，用于高效存储和检索字符串集合。每个节点代表一个字符，从根到某节点的路径对应一个字符串前缀。', '适用于字符串前缀匹配、自动补全、拼写检查、IP路由最长前缀匹配等场景。空间换时间，查询复杂度O(L)，L为字符串长度。', '#include <string>\n#include <vector>\nusing namespace std;\n\nclass Trie {\n    struct Node {\n        vector<Node*> child;\n        bool isEnd;\n        Node() : child(26, nullptr), isEnd(false) {}\n    };\n    Node* root;\npublic:\n    Trie() { root = new Node(); }\n    void insert(string& word) {\n        Node* cur = root;\n        for (char c : word) {\n            int idx = c - ''a'';\n            if (!cur->child[idx]) cur->child[idx] = new Node();\n            cur = cur->child[idx];\n        }\n        cur->isEnd = true;\n    }\n    bool search(string& word) {\n        Node* cur = root;\n        for (char c : word) {\n            int idx = c - ''a'';\n            if (!cur->child[idx]) return false;\n            cur = cur->child[idx];\n        }\n        return cur->isEnd;\n    }\n    bool startsWith(string& prefix) {\n        Node* cur = root;\n        for (char c : prefix) {\n            int idx = c - ''a'';\n            if (!cur->child[idx]) return false;\n            cur = cur->child[idx];\n        }\n        return true;\n    }\n};', (SELECT id FROM algorithm_categories WHERE name='字典树(Trie)'), 'medium', '数据结构,Trie,字符串');

INSERT INTO `algorithms` (`title`, `description`, `usage_intro`, `cpp_template`, `category_id`, `difficulty`, `tags`) VALUES
('Manacher算法', 'Manacher算法在线性时间O(n)内找出字符串中的所有回文子串（以每个字符为中心的最长回文半径）。核心是利用回文的对称性质减少重复计算。', '求解最长回文子串的高效算法，比中心扩展法O(n²)和DP法O(n²)更快。也用于回文子串计数等问题。', '#include <string>\n#include <vector>\nusing namespace std;\n\nstring manacher(string& s) {\n    string t = \"#\";\n    for (char c : s) { t += c; t += ''#''; }\n    int n = t.size(), c = 0, r = 0;\n    vector<int> p(n, 0);\n    for (int i = 0; i < n; i++) {\n        int mirr = 2 * c - i;\n        if (i < r) p[i] = min(r - i, p[mirr]);\n        while (i + p[i] + 1 < n && i - p[i] - 1 >= 0\n               && t[i + p[i] + 1] == t[i - p[i] - 1])\n            p[i]++;\n        if (i + p[i] > r) { c = i; r = i + p[i]; }\n    }\n    int maxLen = 0, center = 0;\n    for (int i = 0; i < n; i++)\n        if (p[i] > maxLen) { maxLen = p[i]; center = i; }\n    int start = (center - maxLen) / 2;\n    return s.substr(start, maxLen);\n}', (SELECT id FROM algorithm_categories WHERE name='Manacher算法'), 'medium', '字符串,Manacher,回文');

INSERT INTO `algorithms` (`title`, `description`, `usage_intro`, `cpp_template`, `category_id`, `difficulty`, `tags`) VALUES
('贪心算法', '贪心算法在每一步选择中都采取当前状态下最优的选择，期望最终结果是全局最优的。贪心策略不一定总能得到全局最优解，需要严格的数学证明。', '适用于具有贪心选择性质和最优子结构的问题，如活动安排、哈夫曼编码、最小生成树（Kruskal/Prim）、找零钱（某些面值体系）等。', '#include <vector>\n#include <algorithm>\nusing namespace std;\n\n// 活动安排问题：选择最多不重叠的区间\nint activitySelection(vector<pair<int,int>>& intervals) {\n    sort(intervals.begin(), intervals.end(),\n         [](auto& a, auto& b) { return a.second < b.second; });\n    int cnt = 1, end = intervals[0].second;\n    for (int i = 1; i < intervals.size(); i++) {\n        if (intervals[i].first >= end) {\n            cnt++;\n            end = intervals[i].second;\n        }\n    }\n    return cnt;\n}', (SELECT id FROM algorithm_categories WHERE name='贪心'), 'medium', '基础算法,贪心');

INSERT INTO `algorithms` (`title`, `description`, `usage_intro`, `cpp_template`, `category_id`, `difficulty`, `tags`) VALUES
('滑动窗口', '滑动窗口技术使用双指针维护一个连续区间（窗口），窗口大小可以固定或不固定。通过在移动过程中增量更新窗口内的信息，将O(n²)的暴力枚举优化到O(n)。', '常用于字符串/数组的连续子串/子数组问题，如最长无重复字符子串、最小覆盖子串、和为定值的最短子数组等。', '#include <string>\n#include <unordered_map>\nusing namespace std;\n\n// 最长无重复字符子串\nint lengthOfLongestSubstring(string s) {\n    unordered_map<char, int> pos;\n    int left = 0, maxLen = 0;\n    for (int right = 0; right < s.size(); right++) {\n        if (pos.count(s[right]))\n            left = max(left, pos[s[right]] + 1);\n        pos[s[right]] = right;\n        maxLen = max(maxLen, right - left + 1);\n    }\n    return maxLen;\n}', (SELECT id FROM algorithm_categories WHERE name='双指针/滑动窗口'), 'medium', '基础算法,双指针,滑动窗口');

INSERT INTO `algorithms` (`title`, `description`, `usage_intro`, `cpp_template`, `category_id`, `difficulty`, `tags`) VALUES
('单调栈', '单调栈是一种特殊的栈结构，栈内元素保持单调递增或单调递减。当遇到破坏单调性的元素时，不断弹出栈顶直到满足单调性。每个元素最多入栈出栈一次，时间复杂度O(n)。', '经典应用包括：寻找每个元素的下一个更大/更小元素（Next Greater Element）、柱状图中最大矩形面积、接雨水问题等。', '#include <vector>\n#include <stack>\nusing namespace std;\n\n// 下一个更大元素\nvector<int> nextGreaterElement(vector<int>& nums) {\n    int n = nums.size();\n    vector<int> res(n, -1);\n    stack<int> st;\n    for (int i = 0; i < n; i++) {\n        while (!st.empty() && nums[st.top()] < nums[i]) {\n            res[st.top()] = nums[i];\n            st.pop();\n        }\n        st.push(i);\n    }\n    return res;\n}', (SELECT id FROM algorithm_categories WHERE name='单调栈/单调队列'), 'medium', '数据结构,单调栈');

INSERT INTO `algorithms` (`title`, `description`, `usage_intro`, `cpp_template`, `category_id`, `difficulty`, `tags`) VALUES
('Bellman-Ford最短路', 'Bellman-Ford算法求解含负权边的单源最短路径，并能检测负环。进行V-1轮松弛操作，每轮遍历所有边。若第V轮仍能松弛，则存在负环。时间复杂度O(VE)。', '适用于含负权边的一般图最短路，或需要检测负环的场景。对于非负权图Dijkstra更高效。', '#include <vector>\nusing namespace std;\n\nstruct Edge { int u, v, w; };\n\nvector<int> bellmanFord(int n, vector<Edge>& edges, int start) {\n    vector<int> dist(n, INT_MAX);\n    dist[start] = 0;\n    for (int i = 0; i < n - 1; i++) {\n        bool updated = false;\n        for (auto& e : edges) {\n            if (dist[e.u] != INT_MAX && dist[e.v] > dist[e.u] + e.w) {\n                dist[e.v] = dist[e.u] + e.w;\n                updated = true;\n            }\n        }\n        if (!updated) break;\n    }\n    // 检测负环\n    for (auto& e : edges)\n        if (dist[e.u] != INT_MAX && dist[e.v] > dist[e.u] + e.w)\n            return {}; // 存在负环\n    return dist;\n}', (SELECT id FROM algorithm_categories WHERE name='最短路'), 'medium', '图论,最短路,Bellman-Ford,负权');

INSERT INTO `algorithms` (`title`, `description`, `usage_intro`, `cpp_template`, `category_id`, `difficulty`, `tags`) VALUES
('Floyd最短路', 'Floyd算法求解任意两点间的最短路径（多源最短路）。使用三重循环的动态规划，dp[k][i][j]表示经过前k个节点时i到j的最短路。可压缩为二维。时间复杂度O(V³)。', '适用于节点数较少（通常V≤500）的全源最短路问题，以及传递闭包、寻找最小环等问题。', '#include <vector>\nusing namespace std;\n\nvoid floyd(vector<vector<int>>& dist) {\n    int n = dist.size();\n    for (int k = 0; k < n; k++)\n        for (int i = 0; i < n; i++)\n            for (int j = 0; j < n; j++)\n                if (dist[i][k] != INT_MAX && dist[k][j] != INT_MAX)\n                    dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j]);\n}', (SELECT id FROM algorithm_categories WHERE name='最短路'), 'medium', '图论,最短路,Floyd,全源');

INSERT INTO `algorithms` (`title`, `description`, `usage_intro`, `cpp_template`, `category_id`, `difficulty`, `tags`) VALUES
('强连通分量(Tarjan)', 'Tarjan算法使用一次DFS求出有向图中所有的强连通分量(SCC)。利用dfn（访问时间戳）和low（能回溯到的最早节点）数组，当dfn[u]==low[u]时，当前栈中u及其之上节点构成一个SCC。', '用于有向图的强连通分量分解，是很多图论问题的基础（如2-SAT问题、缩点建DAG）。', '#include <vector>\nusing namespace std;\n\nvoid tarjan(int u, vector<vector<int>>& adj,\n            vector<int>& dfn, vector<int>& low,\n            vector<bool>& inStack, vector<int>& stk,\n            int& timer, vector<vector<int>>& sccs) {\n    dfn[u] = low[u] = ++timer;\n    stk.push_back(u);\n    inStack[u] = true;\n    for (int v : adj[u]) {\n        if (!dfn[v]) {\n            tarjan(v, adj, dfn, low, inStack, stk, timer, sccs);\n            low[u] = min(low[u], low[v]);\n        } else if (inStack[v]) {\n            low[u] = min(low[u], dfn[v]);\n        }\n    }\n    if (dfn[u] == low[u]) {\n        vector<int> scc;\n        int v;\n        do {\n            v = stk.back(); stk.pop_back();\n            inStack[v] = false;\n            scc.push_back(v);\n        } while (v != u);\n        sccs.push_back(scc);\n    }\n}', (SELECT id FROM algorithm_categories WHERE name='强连通分量(Tarjan)'), 'hard', '图论,SCC,Tarjan');

INSERT INTO `algorithms` (`title`, `description`, `usage_intro`, `cpp_template`, `category_id`, `difficulty`, `tags`) VALUES
('树形DP', '树形DP在树结构上进行动态规划。通常以DFS遍历树，在回溯时合并子节点的状态来计算当前节点的状态。经典问题包括树的最大独立集、树的重心、树的直径等。', '适用于树结构上的最优决策问题。关键技巧是定义好状态（如选/不选当前节点）和转移方程。', '#include <vector>\nusing namespace std;\n\n// 树上最大独立集：选不相邻节点，最大化权值和\nvoid treeDP(int u, int parent, vector<vector<int>>& adj,\n            vector<int>& val, vector<int>& dp0, vector<int>& dp1) {\n    dp0[u] = 0;        // 不选u\n    dp1[u] = val[u];   // 选u\n    for (int v : adj[u]) {\n        if (v == parent) continue;\n        treeDP(v, u, adj, val, dp0, dp1);\n        dp0[u] += max(dp0[v], dp1[v]);\n        dp1[u] += dp0[v];\n    }\n}', (SELECT id FROM algorithm_categories WHERE name='树形DP'), 'medium', 'DP,树形DP,树');

INSERT INTO `algorithms` (`title`, `description`, `usage_intro`, `cpp_template`, `category_id`, `difficulty`, `tags`) VALUES
('欧拉函数', '欧拉函数φ(n)表示1到n中与n互质的正整数个数。计算公式：φ(n)=n×Π(1-1/pi)，其中pi为n的所有不同质因子。积性函数，可用线性筛批量计算。', '在数论中用于简化模运算，是欧拉定理和RSA加密算法的基础。常用于求解同余方程和逆元。', '// 单个数的欧拉函数\nint phi(int n) {\n    int res = n;\n    for (int i = 2; i * i <= n; i++) {\n        if (n % i == 0) {\n            res = res / i * (i - 1);\n            while (n % i == 0) n /= i;\n        }\n    }\n    if (n > 1) res = res / n * (n - 1);\n    return res;\n}\n\n// 线性筛批量求1~n的欧拉函数\nvector<int> phiSieve(int n) {\n    vector<int> phi(n + 1), primes;\n    vector<bool> isPrime(n + 1, true);\n    phi[1] = 1;\n    for (int i = 2; i <= n; i++) {\n        if (isPrime[i]) {\n            primes.push_back(i);\n            phi[i] = i - 1;\n        }\n        for (int p : primes) {\n            if (i * p > n) break;\n            isPrime[i * p] = false;\n            if (i % p == 0) {\n                phi[i * p] = phi[i] * p;\n                break;\n            }\n            phi[i * p] = phi[i] * (p - 1);\n        }\n    }\n    return phi;\n}', (SELECT id FROM algorithm_categories WHERE name='欧拉函数'), 'medium', '数学,数论,欧拉函数');

INSERT INTO `algorithms` (`title`, `description`, `usage_intro`, `cpp_template`, `category_id`, `difficulty`, `tags`) VALUES
('组合数取模', '计算组合数C(n,k) mod p的方法取决于p的性质。p为素数时可用阶乘逆元O(1)查询；p较小而n很大时使用Lucas定理；p不是素数时使用扩展Lucas定理。', '组合数取模是算法竞赛中的常见需求。预处理阶乘和逆元后，单次查询O(1)。注意选择合适的方法应对不同的模数。', 'using ll = long long;\nconst int MOD = 1e9 + 7;\nconst int MAXN = 1e6;\nvector<ll> fact(MAXN + 1), invFact(MAXN + 1);\n\nll quickPow(ll a, ll b) {\n    ll res = 1;\n    while (b) {\n        if (b & 1) res = res * a % MOD;\n        a = a * a % MOD;\n        b >>= 1;\n    }\n    return res;\n}\n\nvoid precompute() {\n    fact[0] = 1;\n    for (int i = 1; i <= MAXN; i++)\n        fact[i] = fact[i-1] * i % MOD;\n    invFact[MAXN] = quickPow(fact[MAXN], MOD - 2);\n    for (int i = MAXN - 1; i >= 0; i--)\n        invFact[i] = invFact[i+1] * (i + 1) % MOD;\n}\n\nll C(int n, int k) {\n    if (k < 0 || k > n) return 0;\n    return fact[n] * invFact[k] % MOD * invFact[n-k] % MOD;\n}', (SELECT id FROM algorithm_categories WHERE name='组合数取模'), 'medium', '数学,组合数,模运算');
