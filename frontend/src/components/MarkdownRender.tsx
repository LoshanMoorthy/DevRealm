import {
    Box,
    Code,
    ListItem,
    OrderedList,
    Text,
    UnorderedList,
  } from "@chakra-ui/react";
  import ReactMarkdown from "react-markdown";
  import remarkGfm from "remark-gfm";
  
  export const MarkdownRender = ({ content }: { content: string }) => {
    return (
      <Box fontSize="sm">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            p: ({ children }) => <Text mb={2}>{children}</Text>,
            strong: ({ children }) => <Text as="span" fontWeight="semibold">{children}</Text>,
            code: ({ children }) => (
              <Code colorScheme="purple" fontSize="0.85em">
                {children}
              </Code>
            ),
            pre: ({ children }) => (
              <Box
                as="pre"
                bg="gray.800"
                color="white"
                p={3}
                borderRadius="md"
                overflowX="auto"
                mb={2}
              >
                {children}
              </Box>
            ),
            ul: ({ children }) => <UnorderedList pl={5} mb={2}>{children}</UnorderedList>,
            ol: ({ children }) => <OrderedList pl={5} mb={2}>{children}</OrderedList>,
            li: ({ children }) => <ListItem mb={1}>{children}</ListItem>,
          }}
        >
          {content}
        </ReactMarkdown>
      </Box>
    );
  };  