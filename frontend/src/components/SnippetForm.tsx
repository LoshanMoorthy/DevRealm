import {
    Box,
    Input,
    Textarea,
    Button,
    Stack,
    Heading,
    useToast,
    Tag,
    Wrap,
    WrapItem,
  } from '@chakra-ui/react';
  import { useState } from 'react';
  import axios from 'axios';
  import ReactMarkdown from 'react-markdown';
  import remarkGfm from 'remark-gfm';
  import { useColorModeValue } from '@chakra-ui/react';

  
  export const SnippetForm = ({ onCreated }: { onCreated: () => void }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState('');
    const [loading, setLoading] = useState(false);
    const toast = useToast();
    const bgColor = useColorModeValue('gray.50', 'gray.800');
    const previewBg = useColorModeValue('white', 'gray.700');
    const borderColor = useColorModeValue('gray.200', 'gray.600');
    const placeholderColor = useColorModeValue('gray.500', 'gray.400');

  
    const handleSubmit = async () => {
      setLoading(true);
      try {
        await axios.post('https://localhost:7270/api/snippets', {
          title,
          content,
          tags: tags.split(',').map(t => t.trim()),
          createdAt: new Date().toISOString(),
        });
        toast({
          title: 'Snippet added',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        setTitle('');
        setContent('');
        setTags('');
        onCreated();
      } catch (err) {
        toast({
          title: 'Error adding snippet',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };
  
    return (
      <Box p={6} bg={bgColor} borderRadius="lg" boxShadow="md" mb={6}>
        <Heading size="md" mb={4}>
          ✍️ Add a New Snippet
        </Heading>
        <Stack spacing={4}>
        <Input
          placeholder="Title (e.g. Binary Search in C#)"
          value={title}
          onChange={e => setTitle(e.target.value)}
          _placeholder={{ color: placeholderColor }}
        />
          <Textarea
            placeholder="Content (Markdown or code)"
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={6}
          />
          {content && (
            <Box mt={4} p={4} border="1px" borderColor={borderColor} borderRadius="md" bg={previewBg}>
                <Heading size="sm" mb={2}>🧾 Preview</Heading>
                <ReactMarkdown children={content} remarkPlugins={[remarkGfm]} />
            </Box>
          )}
          <Input
            placeholder="Tags (comma-separated, e.g. csharp,algorithms)"
            value={tags}
            onChange={e => setTags(e.target.value)}
          />
          <Wrap>
            {tags
              .split(',')
              .filter(t => t.trim() !== '')
              .map((tag, idx) => (
                <WrapItem key={idx}>
                  <Tag>{tag.trim()}</Tag>
                </WrapItem>
              ))}
          </Wrap>
          <Button
            colorScheme="teal"
            onClick={handleSubmit}
            isLoading={loading}
            loadingText="Saving..."
          >
            Save Snippet
          </Button>
        </Stack>
      </Box>
    );
  };  