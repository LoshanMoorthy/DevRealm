import { useEffect, useState } from "react";
import axios from "axios";
import Fuse from "fuse.js";
import { Snippet } from "../types/snippet";
import {
  Box,
  Heading,
  Input,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Tag,
  Spinner,
  Text,
  VStack,
  HStack,
  Icon,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { SnippetForm } from "../components/SnippetForm";

const Home = () => {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const loadSnippets = () => {
    setLoading(true);
    axios
      .get("https://localhost:7270/api/snippets")
      .then((res) => setSnippets(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSnippets();
  }, []);

  const fuse = new Fuse(snippets, {
    keys: ["title", "content", "tags"],
    includeScore: true,
    threshold: 0.3,
  });

  const results =
    searchQuery.trim() === ""
      ? snippets
      : fuse.search(searchQuery).map((res) => res.item);

  return (
    <Box p={6}>
      <Heading mb={6}>🧠 DevRealm Snippets</Heading>

      <SnippetForm onCreated={loadSnippets} />

      <VStack align="start" spacing={4} mb={4}>
        <HStack w="100%">
          <Icon as={SearchIcon} boxSize={5} />
          <Input
            placeholder="Search your brain... (e.g. async await, json, regex)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            variant="filled"
            focusBorderColor="teal.400"
          />
        </HStack>
        <Text fontSize="sm" color="gray.500">
          {searchQuery && results.length === 0 && "No results found."}
          {!searchQuery && `Showing all ${snippets.length} snippets.`}
        </Text>
      </VStack>

      {loading ? (
        <Spinner size="xl" />
      ) : (
        <Table variant="simple" mt={2}>
          <Thead>
            <Tr>
              <Th>Title</Th>
              <Th>Tags</Th>
              <Th>Date</Th>
            </Tr>
          </Thead>
          <Tbody>
            {results.map((snippet) => (
              <Tr key={snippet.id}>
                <Td>{snippet.title}</Td>
                <Td>
                  {snippet.tags.map((tag) => (
                    <Tag key={tag} mr={1}>
                      {tag}
                    </Tag>
                  ))}
                </Td>
                <Td>{new Date(snippet.createdAt).toLocaleString()}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </Box>
  );
};

export default Home;