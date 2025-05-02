import { useEffect, useState, useRef, MutableRefObject } from 'react';
import ForceGraph2D, { ForceGraphMethods } from 'react-force-graph-2d';
import axios from 'axios';
import {
  Box,
  Heading,
  Tag,
  VStack,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  useDisclosure,
  Input,
  Textarea,
  Button,
  HStack
} from '@chakra-ui/react';
import { Snippet } from '../types/snippet';
import { useColorMode, useColorModeValue } from '@chakra-ui/react';
import { MoonIcon, SunIcon } from '@chakra-ui/icons';
import { MarkdownRender } from '../components/MarkdownRender';

type Node = {
  id: string;
  label: string;
  group: 'snippet' | 'tag';
  raw?: Snippet;
  x?: number;
  y?: number;
};

type Link = {
  source: string;
  target: string;
};

export const GraphView = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [selectedSnippet, setSelectedSnippet] = useState<Snippet | null>(null);
  const [highlightedNodes, setHighlightedNodes] = useState<Set<string>>(new Set());
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [hasZoomed, setHasZoomed] = useState(false);
  const { colorMode, toggleColorMode } = useColorMode();

  const fgRef = useRef<ForceGraphMethods<Node, Link>>(null);

  useEffect(() => {
    loadGraph();
  }, []);

  const loadGraph = () => {
    axios.get<Snippet[]>('https://localhost:7270/api/snippets')
      .then(res => {
        const snippets = res.data;
        const allNodes: Node[] = [];
        const allLinks: Link[] = [];

        snippets.forEach((snip) => {
          const snippetNodeId = `snippet-${snip.id}`;
          allNodes.push({
            id: snippetNodeId,
            label: snip.title,
            group: 'snippet',
            raw: snip
          });

          snip.tags.forEach(tag => {
            const tagNodeId = `tag-${tag}`;
            if (!allNodes.find(n => n.id === tagNodeId)) {
              allNodes.push({ id: tagNodeId, label: tag, group: 'tag' });
            }
            allLinks.push({ source: tagNodeId, target: snippetNodeId });
          });

          (snip.relatedIds ?? []).forEach((relatedId) => {
            const toId = `snippet-${relatedId}`;
            allLinks.push({ source: snippetNodeId, target: toId });
          });
        });

        setNodes(allNodes);
        setLinks(allLinks);
        setHasZoomed(false);
      });
  };

  const handleNodeClick = (node: any) => {
    if (node.group === 'tag') {
      const connected = links
        .filter(link => link.source === node.id)
        .map(link => link.target as string);
      setHighlightedNodes(new Set(connected));
      setSelectedTag(node.label);
      fgRef.current?.centerAt(node.x || 0, node.y || 0, 500).zoom(3, 500);
    } else if (node.group === 'snippet' && node.raw) {
      setSelectedSnippet(node.raw);
      setIsEditing(false);
      setAiExplanation(null);
      onOpen();
      fgRef.current?.centerAt(node.x || 0, node.y || 0, 500).zoom(4, 500);
    }
  };

  const bgColor = useColorModeValue('gray.50', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  return (
    <Box p={6} bg={bgColor} color={textColor} minH="100vh">
      <HStack justify="space-between" mb={4}>
        <Heading>🧠 DevRealm Graph</Heading>

        <HStack spacing={2}>
          <Button onClick={() => fgRef.current?.zoomToFit(400)} colorScheme="gray">
            🔄 Reset View
          </Button>
          <Button onClick={toggleColorMode} colorScheme="gray">
            {colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
          </Button>
        </HStack>
      </HStack>

      <ForceGraph2D
        ref={fgRef as MutableRefObject<ForceGraphMethods<Node, Link>>}
        graphData={{ nodes, links }}
        nodeLabel="label"
        nodeCanvasObject={(node, ctx, globalScale) => {
          const label = node.label;
          const fontSize = 12 / globalScale;
          ctx.font = `${fontSize}px 'Segoe UI', sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';

          if (node.group === 'tag') {
            ctx.fillStyle = 'rgba(144, 205, 244, 0.6)';
            ctx.shadowColor = 'rgba(144, 205, 244, 0.9)';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.rect(node.x! - 6, node.y! - 6, 12, 12);
            ctx.fill();
            ctx.shadowBlur = 0;
          } else {
            ctx.fillStyle = 'rgba(59, 130, 246, 0.8)';
            ctx.shadowColor = 'rgba(59, 130, 246, 0.9)';
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.arc(node.x!, node.y!, 7, 0, 2 * Math.PI);
            ctx.fill();
            ctx.shadowBlur = 0;
          }

          ctx.fillStyle = colorMode === 'dark' ? '#fff' : '#222';
          ctx.fillText(label, node.x!, node.y! + 10);
        }}
        linkColor={(link) => {
          const source = typeof link.source === 'string' ? link.source : (link.source as any).id;
          return source?.startsWith('tag-') ? '#ddd' : '#3182ce';
        }}
        linkDirectionalParticles={2}
        linkDirectionalParticleSpeed={0.005}
        linkDirectionalArrowLength={4}
        cooldownTicks={200}
        nodeRelSize={7}
        onEngineStop={() => {
          if (!hasZoomed) {
            fgRef.current?.zoomToFit(400);
            setHasZoomed(true);
          }
        }}
        onNodeClick={handleNodeClick}
        width={window.innerWidth - 100}
        height={600}
      />

      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="sm">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px">
            {selectedSnippet?.title || 'Snippet'}
          </DrawerHeader>
          <DrawerBody>
            {isEditing && selectedSnippet ? (
              <VStack align="stretch" spacing={3}>
                <Input
                  placeholder="Title"
                  value={selectedSnippet.title}
                  onChange={(e) =>
                    setSelectedSnippet({ ...selectedSnippet, title: e.target.value })
                  }
                />
                <Textarea
                  placeholder="Content"
                  value={selectedSnippet.content}
                  onChange={(e) =>
                    setSelectedSnippet({ ...selectedSnippet, content: e.target.value })
                  }
                  rows={8}
                />
                <Input
                  placeholder="Tags (comma separated)"
                  value={selectedSnippet.tags.join(',')}
                  onChange={(e) =>
                    setSelectedSnippet({
                      ...selectedSnippet,
                      tags: e.target.value.split(',').map((t) => t.trim()),
                    })
                  }
                />
                <Input
                  placeholder="Related IDs"
                  value={(selectedSnippet.relatedIds ?? []).join(',')}
                  onChange={(e) =>
                    setSelectedSnippet({
                      ...selectedSnippet,
                      relatedIds: e.target.value
                        .split(',')
                        .map((id) => parseInt(id.trim()))
                        .filter((n) => !isNaN(n)),
                    })
                  }
                />
                <Button
                  colorScheme="teal"
                  onClick={() => {
                    axios
                      .put(`https://localhost:7270/api/snippets/${selectedSnippet.id}`, selectedSnippet)
                      .then(() => {
                        setIsEditing(false);
                        onClose();
                        loadGraph();
                      });
                  }}
                >
                  💾 Save
                </Button>
              </VStack>
            ) : (
              <>
                <VStack align="start" spacing={3} mb={4}>
                  {selectedSnippet?.tags.map((tag) => (
                    <Tag key={tag} colorScheme="blue">
                      {tag}
                    </Tag>
                  ))}
                </VStack>

                <Box mb={4}>
                  <MarkdownRender content={selectedSnippet?.content || ''} />
                </Box>

                <HStack spacing={4}>
                  <Button onClick={() => setIsEditing(true)} colorScheme="blue">
                    ✏️ Edit
                  </Button>
                  <Button
                    onClick={() => {
                      if (!selectedSnippet) return;
                      setAiExplanation('⏳ Thinking...');
                      axios
                        .post('https://localhost:7270/api/explain', selectedSnippet)
                        .then((res) => setAiExplanation(res.data))
                        .catch(() => setAiExplanation('🧠 AI explanation failed.'));
                    }}
                    colorScheme="purple"
                  >
                    🧠 Explain this snippet
                  </Button>
                </HStack>

                {aiExplanation && (
                  <Box
                    mt={4}
                    p={3}
                    bg={colorMode === 'dark' ? 'gray.700' : 'gray.100'}
                    borderRadius="md"
                    fontSize="sm"
                    whiteSpace="pre-wrap"
                  >
                    <MarkdownRender content={aiExplanation} />
                  </Box>
                )}
              </>
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};
